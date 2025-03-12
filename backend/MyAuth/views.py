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

from .utils import generate_otp_secret, generate_otp_uri,verify_otp ,generate_qr_code

import qrcode
from io import BytesIO
from django.core.files.base import ContentFile

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
    serializer_class=UserRegisterSerializer
    def post(self,request):
        otpcode=request.data.get('otp')
        try:
            user_code_obj = OneTimePassword.objects.get(code=otpcode)
            if   not user_code_obj.user.is_verified:
                if  str(user_code_obj.code) == str(otpcode):
                    user_code_obj.user.is_verified = True
                    user_code_obj.user.is_active = True
                    user_code_obj.user.save()
                    return Response({
                        'message':'account email verified successfully'
                    },status=status.HTTP_200_OK)
            return Response(
                    {
                        'message':'code is invalid user already verified'
                    },status=status.HTTP_204_NO_CONTENT)
        except OneTimePassword.DoesNotExist:
            return Response({'message':'1 passcode not provided'}, status=status.HTTP_404_NOT_FOUND)

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
                        'access_token': str(user_tokens['access']), 
                        'refresh_token': str(user_tokens['refresh'])  
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        data={
            'msg':'its works'
        }
        return Response(data, status=status.HTTP_200_OK)

class  PasswordResetRequestView(GenericAPIView):
    serializer_class=PasswordResetRequestSerializer
    def post(self, request):
        serializer= self.serializer_class(data=request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        return Response({'message':"a link has been sent to  your email to reset your password"},status=status.HTTP_200_OK)

class PasswordResetConfirm(GenericAPIView):
    def get(self,request,uidb64,token):
        try:
            user_id=smart_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user,token):
                return Response({'message':'token is invalid or has expired'},status=status.HTTP_401_UNAUTHORIZED)
            return Response({'success':True,'message':'credentials is valid','uidb64':uidb64,'token':token},status=status.HTTP_200_OK)
        except DjangoUnicodeDecodeError:
            return Response({'message':'token is invalid or has expired'},status=status.HTTP_401_UNAUTHORIZED)
    

class SetNewPassword(GenericAPIView):
    serializer_class=SetNewPasswordSerializer
    def patch(self,request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'message':'password reset successful'},status=status.HTTP_200_OK)
    

class LogoutUserView(GenericAPIView):
    serializer_class=LogoutUserSerializer
    permission_LogoutUserViewclasses=[IsAuthenticated]


    def post(self,request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class Enable2FAView(GenericAPIView):
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        user.otp_secret = generate_otp_secret()
        user.is_2fa_enabled = True
        user.save()

        otp_uri = generate_otp_uri(user)
        qr_code = generate_qr_code(otp_uri)
        print(qr_code)

        return Response({
            "otp_uri": otp_uri,
            "qr_code_url": qr_code,
        }, status=status.HTTP_200_OK)
        

class debugView(GenericAPIView):
    def get(self,request):
        user = request.user
        print(user)
        print(request)
        if (User.is_authenticated):
            print (True)
        else:
            print(False)
        return Response({"hello":"hello"},status=status.HTTP_200_OK)
class   _42Redirect(GenericAPIView):

    def get(self ,request):
        url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.API42_UID}&redirect_uri={settings.API42_REDIRECT_URI}&response_type=code&scope=public"
        return redirect(url)
    
from rest_framework.renderers import JSONRenderer # type: ignore

class CollectAuthorizeCode(GenericAPIView):
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "No authorization code provided"}, status=400)

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
            return Response({"error": "Failed to fetch access token", "details": str(e)}, status=400)
        access_token = response.json().get("access_token")
        refresh_token = response.json().get("refresh_token")
        if not access_token:
            return Response({"error": "Access token not found in response"}, status=400)

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
                id = user_data.get("id"),
                email= user_data.get("email"),
                first_name = user_data.get("first_name"),
                last_name = user_data.get("last_name"),
                )
                image_url = user_data.get("image")
                if image_url:
                    user.download_profile_image_from_url(image_url)
                user.save()
                print(user)
            else:
                if usr1.is_2fa_enabled:
                    temp_token = str(uuid.uuid4()) 
                    cache.set(temp_token, usr1.id, timeout=10000)
                    return Response({"detail": "2FA required", "temp_token": temp_token},status=401)
                return Response({"access_token": access_token,"refresh_token":refresh_token}, status=200)
        else:
            print(f"Failed to fetch user data. Status code: {response.status_code}")
            print(f"Error message: {response.text}")
        return Response({"access_token": access_token,"refresh_token":refresh_token}, status=200)

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



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from friendship.models import Friend ,FriendshipRequest,Block

from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()  


@receiver(post_save, sender=FriendshipRequest)
def send_friend_request_notification(sender, instance, created, **kwargs):
    if created:  # Only send notifications for new friend requests
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notifications_{instance.to_user.id}",  # Send to the recipient's group
            {
                'type': 'send_notification',  # This matches the method in NotificationConsumer
                'from_user_id': instance.from_user.id,  # ID of the sender
                'from_user_username': instance.from_user.username,  # Username of the sender
                'message': f"You have a new friend request from {instance.from_user.username}.",  # Notification message
            }
        )
#list friend 
class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        user = request.user
        print(user)
        friendships = Friend.objects.filter(Q(from_user=user) | Q(to_user=user))
        for friendship in friendships:
            print(friendship.from_user_id," " ,friendship.to_user_id)
            print(user.id)
        friend_ids = []
        for friendship in friendships:
            if friendship.from_user_id == user.id:
                friend_ids.append(friendship.to_user_id)
            else:
                friend_ids.append(friendship.from_user_id)
        print("friends", friend_ids)
        #friend_data = [{"id": friend.id} for friend in friends]
        
        return Response({"friends_id":friend_ids})

from friendship.models import FriendshipRequest

#list receive friend request
class ReceiveFriendRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user 
        receiveRequest = FriendshipRequest.objects.filter(to_user=user)
        print(f"receive request: {receiveRequest}")
        request_id  = -1
        for request in receiveRequest:
            request_id = request.id
            print(f"request ID: {request_id}")
            print(f"receive from: {request.from_user}")
        return Response({"friends": "nice","Request ID": request_id},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#list sent request friend 
class SentFriendRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sent_requests = FriendshipRequest.objects.filter(from_user=user)
        print(f"sent request: {sent_requests}")
        for request in sent_requests:
            print(f"sent request to: {request.to_user}")
        return Response({"friends": "nice"})

# list users by names
from django.core.paginator import Paginator
class SearchUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()

        if not search_query:
            return Response({"error": "Search query is required."}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(name__unaccent__icontains=search_query).values("id", "username")

        if not users:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Pagination
        paginator = Paginator(users, 10)  # 10 users per page
        page = request.query_params.get("page", 1)
        paginated_users = paginator.get_page(page)

        return Response({
            "results": list(paginated_users),
            "pagination": {
                "current_page": paginated_users.number,
                "total_pages": paginator.num_pages,
                "total_results": paginator.count
            }
        }, status=status.HTTP_200_OK)

# GET /api/friends/status/{user_id}/ → Check friendship status
# (friends | pending_request | not_friends | blocked).
from django.db.models import Q

class FriendStatus(APIView):
    def get(self,request):
        id = request.data.get("id")
        user = request.user
        check_user = User.objects.all(id = id)
        if not check_user and not user:
            return Response({"error:": "User not found"},status = 400)
        status = Friend.objects.are_friends(user, check_user)
        print(status)
        if status ==  True:
            return Response({"status:":"friend"},status = 200)
        status =   FriendshipRequest.objects.filter(
        (Q(from_user=user, to_user=check_user) | Q(from_user=check_user, to_user=user))
    ).exists()
        if status ==  True:
            return Response({"status:":"friend request is exist"},status = 200)
        status =  Block.objects.filter(
        Q(blocker=user, blocked=check_user) | Q(blocker=check_user, blocked=user)
    ).exists()
        if status ==  True:
            return Response({"status:":"Block"},status = 200)
        return Response({"status:":"not friend"},status = 200)


class CancelFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, request_id):
        try:
            friend_request = FriendshipRequest.objects.get(id=request_id, sender=request.user)
            friend_request.delete()
            return Response({"message": "Friend request canceled successfully."}, status=status.HTTP_200_OK)
        except FriendshipRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_400_BAD_REQUEST)


class RemoveFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, friend_id):
        try:
            friendship = Friend.objects.filter(
                Q(user1=request.user, user2_id=friend_id) | Q(user1_id=friend_id, user2=request.user)
            ).first()
            if not friendship:
                return Response({"error": "Friendship does not exist."}, status=status.HTTP_400_BAD_REQUEST)
            friendship.delete()
            return Response({"message": "Friend removed successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UnblockUser(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            blocked_user = Block.objects.filter(blocker=request.user, blocked_id=user_id).first()
            if not blocked_user:
                return Response({"error": "User is not blocked."}, status=status.HTTP_400_BAD_REQUEST)
            blocked_user.delete()
            return Response({"message": "User unblocked successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .serializers import UserSerializer
from rest_framework.exceptions import PermissionDenied

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        
        user = User.objects.filter(id=user_id).first()
        if user:
            if Block.objects.filter(blocker=user, blocked=self.request.user).exists() or \
                Block.objects.filter(blocker=self.request.user, blocked=user).exists():
                raise PermissionDenied("You are blocked by the user")
            serializer = UserSerializer(user)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class MyInfo(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)
class BlockedUsersList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        blocked_users = User.objects.filter(
            id__in=Block.objects.filter(blocker=request.user).values_list("blocked", flat=True)
        ).values("username")  
        return Response({"blocked_users": list(blocked_users)}, status=status.HTTP_200_OK)

class RespondFriendRequestView(APIView):

    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            requestID = request.data.get('requestID')
            print("request ID" ,requestID )
            action = request.data.get('action')
            print("action " ,action)
            if not requestID or not action:
                return Response({"error": "requestID or action is required"}, status=status.HTTP_400_BAD_REQUEST)
            if action not in ["accept", "reject"]:
                return Response({"error": "Invalid action. Must be 'accept' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                friendRequest = FriendshipRequest.objects.get(pk=requestID)
                print("friendRequest ",friendRequest)
            except FriendshipRequest.DoesNotExist:
                return Response({"error": "Friend request not found"}, status=status.HTTP_404_NOT_FOUND)
            if friendRequest.to_user != request.user:
                return Response({"error": "You are not authorized to accept this request"}, status=status.HTTP_403_FORBIDDEN)
            if action == "accept":
                #friend1 = Friend.objects.create(from_user_id=friendRequest.from_user_id, to_user_id=friendRequest.to_user_id)
                friend1, created = Friend.objects.get_or_create(
        from_user_id=friendRequest.from_user_id,
        to_user_id=friendRequest.to_user_id
    )
                print("i m here")
                friendRequest.delete()
                print("friend1", friend1)
                return Response({"message": "Friend request accepted"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error -- ": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class send_friend_request(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        from_user = request.user
        print("request " , request.data)
        email = request.data.get('email')
        to_user = User.objects.get(email = email)
        print("user: " , to_user)
        if Friend.objects.are_friends(from_user, to_user): 
            return  Response({"they are all ready friend"})
        if FriendshipRequest.objects.filter(from_user=from_user, to_user=to_user,  rejected__isnull=True).exists() or \
            FriendshipRequest.objects.filter(from_user=to_user, to_user=from_user, rejected__isnull=True).exists():
            return Response({"the invitation already exist"})
        print(from_user, "   ",to_user)
        if from_user != to_user:
            print("im here 111") 
            friendship_request = FriendshipRequest.objects.create(from_user=from_user, to_user=to_user)
            friendship_request.save() 

        return  Response({"the invitation sent successfully"})




from rest_framework.response import Response
from rest_framework.views import APIView
from django.apps import apps


# class ModelListView(APIView):
#     def get(self, request):
#         model_names = []
#         for app_config in apps.get_app_configs():
#             for model in app_config.get_models():
#                 model_names.append(model._meta.model_name)
#         return Response({"models": model_names})
class MyModelDeleteAllView(APIView):
    def delete(self, request, format=None):
        try:
            deleted_count = User.objects.all().delete()

            if deleted_count[0] > 0: # Check if any objects were actually deleted
                return Response(
                    {"message": f"{deleted_count[0]} objects deleted successfully."},
                    status=status.HTTP_204_NO_CONTENT,  # 204 No Content is common for DELETE
                )
            else:
                return Response(
                    {"message": "No objects to delete."},
                    status=status.HTTP_204_NO_CONTENT,  # Or 404 Not Found if you expect objects to exist
                )

        except Exception as e:  # Handle potential errors
            return Response(
                {"error": str(e)},  # Log the error for debugging!
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


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
