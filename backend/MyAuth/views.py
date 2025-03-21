import uuid
from django.shortcuts import render
import requests

from backend import settings# type: ignore
from .serializers import UserRegisterSerializer,LoginSerializer,PasswordResetRequestSerializer\
                            ,SetNewPasswordSerializer,LogoutUserSerializer,OTPSerializer
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from .utils import send_code_to_user
from .models import User
from rest_framework.generics import GenericAPIView# type: ignore
from .models import OneTimePassword
from rest_framework.permissions import IsAuthenticated# type: ignore
from django.utils.http import urlsafe_base64_decode# type: ignore
from django.utils.encoding import smart_str,DjangoUnicodeDecodeError# type: ignore
from django.contrib.auth.tokens import PasswordResetTokenGenerator# type: ignore
from django.core.cache import cache
from urllib.parse import quote

from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from .utils import generate_otp_secret, generate_otp_uri,verify_otp ,generate_qr_code

import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from rest_framework.renderers import JSONRenderer # type: ignore

from django.shortcuts import redirect
from rest_framework.permissions import AllowAny  # type: ignore # Important for OAuth redirect
from rest_framework.parsers import JSONParser,MultiPartParser, FormParser

class RegisterUserView(GenericAPIView):
    serializer_class=UserRegisterSerializer
    parser_classes = (JSONParser, FormParser,MultiPartParser)
    def post(self,request):
        user_data=request.data
        serializer =self.serializer_class(data=user_data)
        if serializer.is_valid():
            
            user = serializer.save()
            print("email:" ,user_data['email'] )
            send_code_to_user(user_data['email'],user)
            return Response({
                'data':user_data,
                'message':f'Hi {user_data['first_name']} Thanks for signing up! A passcode has been sent to your email.'
            },status=status.HTTP_201_CREATED)
        email_errors = serializer.errors.get('email', [])
        if any("already exists" in str(e) for e in email_errors):
            return Response({
                    "error": {
                        "email": email_errors[0]
                    }
                }, status=status.HTTP_409_CONFLICT)
        if 'non_field_errors' in serializer.errors and len(serializer.errors) == 1:
            return Response({
                "error": "Invalid input",
                "details": str(serializer.errors['non_field_errors'][0])
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response({  "error": "Invalid input",
                            "details": serializer.errors
                        } ,
                        status=status.HTTP_400_BAD_REQUEST)
class VerifyUserEmail(GenericAPIView):
    def post(self,request):
        email=request.data.get('email')
        otpcode=request.data.get('otp')
        if not email or not otpcode:
            return Response({
                "error": "Missing email or verification code."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_code_obj = OneTimePassword.objects.get(code=otpcode)
            if   not user_code_obj.user.is_verified:
                if  str(user_code_obj.code) == str(otpcode):
                    if str(user_code_obj.user.email) == str(email):
                        user_code_obj.user.is_verified = True
                        user_code_obj.user.is_active = True
                        user_code_obj.user.save()
                        return Response({
                            'message':'account email verified successfully',
                            "user": {
                                        "id": user_code_obj.user.id,
                                        "email": user_code_obj.user.email,
                                        "is_verified": user_code_obj.user.is_verified
                                    }
                        },status=status.HTTP_200_OK)
                    else:
                        return Response({  "error": "Invalid verification code"
                            }, status=status.HTTP_404_NOT_FOUND)
            return Response(
                    {
                        "error": "user already verified"
                    },status=status.HTTP_409_CONFLICT)
        except OneTimePassword.DoesNotExist:
            return Response({  "error": "Invalid verification code"
                            }, status=status.HTTP_404_NOT_FOUND)

class VerifyView(GenericAPIView):
    serializer_class = OTPSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        print("Request Data:", request.data)
        if serializer.is_valid():
            id = cache.get(request.data.get("temp_token"))
            print("id ", id)
            user =User.objects.get(id=id)
            user_tokens = user.tokens()
            return Response({
                            'id':user.id,
                            'email':user.email,
                            'first_name':user.first_name,
                            'last_name':user.last_name,
                            'access_token': str(user_tokens.get('access')),
                            'refresh_token':str(user_tokens.get('refresh'))
                            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class LoginUserView(GenericAPIView):
    def post(self, request):
        serializer_class = LoginSerializer(data=request.data)

        try:
            serializer_class.is_valid(raise_exception=True)
        except AuthenticationFailed as e:
            if "2FA required" in str(e.detail):
                return Response(
                        {
                            "message": "2FA required",
                            "temp_token": e.detail["temp_token"]
                        },
                        status=status.HTTP_202_ACCEPTED
                    )
            elif "Email is not verified" in str(e.detail):
                    return Response(
                        {
                            "error": "Forbidden",
                            "details": "Email is not verified."
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            elif "Invalid email or password" in str(e.detail):
                    return Response(
                        {
                            "error": "Unauthorized",
                            "details": "Invalid email or password."
                        },
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            else:
                    return Response(
                        {
                            "error": "Unauthorized",
                            "details": str(e.detail)
                        },
                        status=status.HTTP_401_UNAUTHORIZED
                    )
        except serializers.ValidationError as e:
                if "Email and password are required" in str(e.detail):
                    return Response(
                        {
                            "error": "Invalid input",
                            "details": "Email and password are required."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif "No user found with this email" in str(e.detail):
                    return Response(
                        {
                            "error": "Not Found",
                            "details": "No user found with this email."
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
                else:
                    return Response(
                        {
                            "error": "Invalid input",
                            "details": str(e.detail)
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

        return Response(serializer_class.validated_data, status=status.HTTP_200_OK)


class Enable2FAView(GenericAPIView):
    def post(self, request):
        user = request.user
        msg = request.data.get("confirmation")
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if user.is_2fa_enabled:
            return Response({
            "message": "2FA is already enabled"
            },status=status.HTTP_200_OK)
            
        if str(msg) == str("YES"):
            user.otp_secret = generate_otp_secret()
            user.is_2fa_enabled = True
            user.save()

            otp_uri = generate_otp_uri(user)
            qr_code = generate_qr_code(otp_uri)
            print(qr_code)

            return Response({
                "message": "2FA enabled",
                "otp_uri": otp_uri,
                "qr_code_url": qr_code,
            }, status=status.HTTP_200_OK)
        return Response({"message": "Two-factor authentication is not being enabled successfully."}, status=status.HTTP_200_OK)

class Disable2FAView(GenericAPIView):
    def post(self, request):
        user = request.user
        msg = request.data.get("confirmation")
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if user.is_2fa_enabled == False:
            return Response({
                "message": "2FA is already disabled"
                },status=status.HTTP_200_OK)
        if str(msg) == str("YES"):
            user.is_2fa_enabled = False
            user.save()
            return Response({
                "message": "2FA  disable",
            }, status=status.HTTP_200_OK)
        return Response({"message": "2FA is not being disabled successfully."}, status=status.HTTP_200_OK)

class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        data={
            'msg':'its works'
        }
        return Response(data, status=status.HTTP_200_OK)



# class debugView(GenericAPIView):
#     def get(self,request):
#         user = request.user
#         print(user)
#         print(request)
#         if (User.is_authenticated):
#             print (True)
#         else:
#             print(False)
#         return Response({"hello":"hello"},status=status.HTTP_200_OK)
class   _42Redirect(GenericAPIView):

    def get(self ,request):
        url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.API42_UID}&redirect_uri={settings.API42_REDIRECT_URI}&response_type=code&scope=public"
        return redirect(url)
    


class CollectAuthorizeCode(GenericAPIView):
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "No authorization code provided"}, status=status.HTTP_400_BAD_REQUEST)

        token_url = "https://api.intra.42.fr/oauth/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": settings.API42_UID,
            "client_secret": settings.API42_SECRET,
            "code": code,
            "redirect_uri": settings.API42_REDIRECT_URI,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            response = requests.post(token_url, data=data, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({"error": "Failed to fetch access token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST0)
        access_token = response.json().get("access_token")
        refresh_token = response.json().get("refresh_token")
        if not access_token:
            return Response({"error": "Access token not found in response"}, status=status.HTTP_400_BAD_REQUEST)

        user_url = "https://api.intra.42.fr/v2/me"

        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        response = requests.get(user_url, headers=headers)
        print("----------------------")
        print(response.text)
        print("----------------------")
        if response.status_code == 200:
            user_data = response.json()
            email = user_data.get("email")
            usr1 = None
            user = None
            if User.objects.filter(email=email).exists():
                usr1 = User.objects.get(email=email)
            if usr1 is None:
                user = User.objects.create_user(
                email= user_data.get("email"),
                first_name = user_data.get("first_name"),
                last_name = user_data.get("last_name"),
                )
                image = user_data.get("image")
                if image and image.get("link"):
                    user.download_profile_image_from_url(image["link"])
                user.save()
                print(user)
                return Response({"access_token": access_token,"refresh_token":refresh_token}, status=status.HTTP_200_OK)
            else:
                if usr1.is_2fa_enabled:
                    temp_token = str(uuid.uuid4()) 
                    cache.set(temp_token, usr1.id, timeout=10000)
                    return Response({"detail": "2FA required", "temp_token": temp_token},
                                    status=status.HTTP_401_UNAUTHORIZED,)
                return Response({"access_token": access_token,"refresh_token":refresh_token}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Failed to fetch user data."},
                status=status.HTTP_400_BAD_REQUEST)

class DeleteUser(GenericAPIView):
    def post(self ,request):
        id = request.data.get("id")
        print(id)
        user = User.objects.get(id = id)
        user.delete()
        print(user)
        return Response({"shrug":"shrug"})
    
    
def testJs(request):
    return render(request,"x.html")

### ------------------------------- friends api -------------------------



# list users by names
# from django.core.paginator import Paginator
# class SearchUser(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         search_query = request.query_params.get("search", "").strip()

#         if not search_query:
#             return Response({"error": "Search query is required."}, status=status.HTTP_400_BAD_REQUEST)

#         users = User.objects.filter(name__unaccent__icontains=search_query).values("id", "username")

#         if not users:
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Pagination
#         paginator = Paginator(users, 10)  # 10 users per page
#         page = request.query_params.get("page", 1)
#         paginated_users = paginator.get_page(page)

#         return Response({
#             "results": list(paginated_users),
#             "pagination": {
#                 "current_page": paginated_users.number,
#                 "total_pages": paginator.num_pages,
#                 "total_results": paginator.count
#             }
#         }, status=status.HTTP_200_OK)

# GET /api/friends/status/{user_id}/ → Check friendship status
# (friends | pending_request | not_friends | blocked).



# class ModelListView(APIView):
#     def get(self, request):
#         model_names = []
#         for app_config in apps.get_app_configs():
#             for model in app_config.get_models():
#                 model_names.append(model._meta.model_name)
#         return Response({"models": model_names})
# class MyModelDeleteAllView(APIView):
#     def delete(self, request, format=None):
#         try:
#             deleted_count = User.objects.all().delete()

#             if deleted_count[0] > 0: # Check if any objects were actually deleted
#                 return Response(
#                     {"message": f"{deleted_count[0]} objects deleted successfully."},
#                     status=status.HTTP_204_NO_CONTENT,  # 204 No Content is common for DELETE
#                 )
#             else:
#                 return Response(
#                     {"message": "No objects to delete."},
#                     status=status.HTTP_204_NO_CONTENT,  # Or 404 Not Found if you expect objects to exist
#                 )

#         except Exception as e:  # Handle potential errors
#             return Response(
#                 {"error": str(e)},  # Log the error for debugging!
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )
from django.apps import apps
from rest_framework.views import APIView


class ModelManagementView(APIView):
    def get(self, request):
        model_names = []
        for app_config in apps.get_app_configs():
            for model in app_config.get_models():
                model_names.append(model._meta.model_name)
        return Response({"models": model_names})

    def delete(self, request):
        try:
            app_label = request.data.get('app_label')  
            model_name = request.data.get('model_name')
            if not app_label or not model_name:
                return Response(
                    {"error": "Both 'app_label' and 'model_name' are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                model = apps.get_model(app_label, model_name)
            except LookupError:
                return Response(
                    {"error": f"Model '{model_name}' not found in app '{app_label}'."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            deleted_count = model.objects.all().delete()

            if deleted_count[0] > 0:
                return Response(
                    {"message": f"{deleted_count[0]} objects from {model_name} deleted successfully."},
                    status=status.HTTP_204_NO_CONTENT,
                )
            else:
                return Response(
                    {"message": f"No objects found to delete in {model_name}."},
                    status=status.HTTP_204_NO_CONTENT,
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# --------- user management ----------------
# class  PasswordResetRequestView(GenericAPIView):
#     serializer_class=PasswordResetRequestSerializer
#     def post(self, request):
#         serializer= self.serializer_class(data=request.data, context={'request':request})
#         serializer.is_valid(raise_exception=True)
#         return Response({'message':"a link has been sent to  your email to reset your password"},status=status.HTTP_200_OK)

# class PasswordResetConfirm(GenericAPIView):
#     def get(self,request,uidb64,token):
#         try:
#             user_id=smart_str(urlsafe_base64_decode(uidb64))
#             user=User.objects.get(id=user_id)
#             if not PasswordResetTokenGenerator().check_token(user,token):
#                 return Response({'message':'token is invalid or has expired'},status=status.HTTP_401_UNAUTHORIZED)
#             return Response({'success':True,'message':'credentials is valid','uidb64':uidb64,'token':token},status=status.HTTP_200_OK)
#         except DjangoUnicodeDecodeError:
#             return Response({'message':'token is invalid or has expired'},status=status.HTTP_401_UNAUTHORIZED)
    

# class SetNewPassword(GenericAPIView):
#     serializer_class=SetNewPasswordSerializer
#     def patch(self,request):
#         serializer=self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         return Response({'message':'password reset successful'},status=status.HTTP_200_OK)
    

# class LogoutUserView(GenericAPIView):
#     serializer_class=LogoutUserSerializer
#     permission_LogoutUserViewclasses=[IsAuthenticated]


#     def post(self,request):
#         serializer=self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)