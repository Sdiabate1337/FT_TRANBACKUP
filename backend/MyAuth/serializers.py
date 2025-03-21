import hashlib
from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import smart_str,smart_bytes,force_str
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from .utils import send_normal_email
from rest_framework_simplejwt.tokens import RefreshToken ,Token
from rest_framework_simplejwt.exceptions import TokenError
# from django.contrib.auth.models import User
from .utils import verify_otp
import uuid
from django.core.cache import cache

from django.contrib.auth.hashers import make_password, check_password

# test this fucking register api
class UserRegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(max_length=68,min_length=6, write_only=True)
    password2=serializers.CharField(max_length=68,min_length=6, write_only=True)

    class Meta:
        model=User
        fields=['email','first_name','last_name','password','password2']
    
    def validate(self,attrs):
        password = attrs.get('password','')
        password2 = attrs.get('password2','')
        if password != password2:
            raise serializers.ValidationError("Password and password confirmation do not match.")
        return attrs

    def create(self,validated_data):
        user=User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=validated_data.get('password'),   
        )
        return user

class OTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6, required=True)
    temp_token = serializers.CharField(required=True)
    def validate(self, attrs):
        print("Received data:", attrs) 
        oo = attrs.get("otp")
        temp_token = attrs.get("temp_token")
        print(oo," -- ",temp_token)
        user_id = cache.get(temp_token)
        user = User.objects.get(id=user_id)
        if not verify_otp(user, oo):
            raise serializers.ValidationError({"error": "The OTP is not valid"})   
        print(type(attrs))
        return attrs

class LoginSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(max_length=255,min_length=6)
    password=serializers.CharField(max_length=68,write_only=True)
    full_name=serializers.CharField(max_length=255,read_only=True)
    access_token=serializers.CharField(max_length=255,read_only=True)
    refresh_token=serializers.CharField(max_length=255,read_only=True) 
    class Meta:
        model=User
        fields=['email','password','full_name','access_token','refresh_token']

    def validate(self, attrs):
        email=attrs.get('email')
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        try:
            print("email " , email)
            email1 = User.objects.get(email=email).email
            print("email " , email1)
            password_saved = User.objects.get(email=email).password
        except:
                raise serializers.ValidationError("No user found with this email.")
        user=authenticate(email=email,password=password)
        if not user:
            if email1  and  check_password(password, password_saved):
                raise AuthenticationFailed('Email is not verified.')
            raise AuthenticationFailed('Invalid email or password.')
        if user.is_2fa_enabled:
            temp_token = str(uuid.uuid4()) 
            cache.set(temp_token, user.id, timeout=10000)
            raise AuthenticationFailed({"detail": "2FA required", "temp_token": temp_token})
        user_tokens = user.tokens()

        return {
            'id':user.id,
            'email':user.email,
            'first_name':user.first_name,
            'last_name':user.last_name,
            'access_token': str(user_tokens.get('access')),
            'refresh_token':str(user_tokens.get('refresh'))
        }

class PasswordResetRequestSerializer(serializers.Serializer):
    email=serializers.EmailField(max_length=255)

    class Meta:
        fields=['email']   

    def validate(self, attrs):
        email = attrs.get('email')
        if  User.objects.filter(email=email).exists():
            user=User.objects.get(email=email)
            uidb64=urlsafe_base64_encode(smart_bytes(user.id))
            token=PasswordResetTokenGenerator().make_token(user)
            request=self.context.get('request')
            site_domain=get_current_site(request).domain
            relative_link = reverse('password-reset-confirm',kwargs={'uidb64':uidb64,'token':token})
            abslink= f"http://{site_domain}{relative_link}"
            email_body= f"Hi use the link below to reset your password \n {abslink}"
            data={
                'email_body': email_body,
                'email_subject':"Reset your Password",
                'to_email':user.email
            }
            send_normal_email(data)
        return super().validate(attrs)
class SetNewPasswordSerializer(serializers.Serializer):
    password=serializers.CharField(max_length=68,min_length=6, write_only=True)
    confirm_password=serializers.CharField(max_length=68,min_length=6, write_only=True)
    uidb64=serializers.CharField(write_only=True)
    token=serializers.CharField(write_only=True)


    class Meta:
        fields = ["password","confirm_password","uidb64","token"]
    def validate(self, attrs):
        try:
            token=attrs.get('token')
            uidb64=attrs.get('uidb64')
            password=attrs.get('password')
            confirm_password=attrs.get('confirm_password')
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user,token):
                raise AuthenticationFailed("reset link is invalid or expired")
            if password != confirm_password:
                raise AuthenticationFailed("passwords do not match")
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            return AuthenticationFailed("link is  invalid or has expired")
        
class LogoutUserSerializer(serializers.Serializer):
    refresh_token=serializers.CharField()

    default_error_message={
        'bad_token':('Token is Invalid or has expired')
    }

    def validate(self, attrs):
        self.token=attrs.get('refresh_token')
        return attrs
    def  save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()

        except TokenError:
            return self.fail('bad_token')


from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_verified",
            "is_active",
            "date_joined",
            "last_login",
            "is_2fa_enabled",
            "profile_image_url",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "is_verified", "is_active"]

    def get_full_name(self, obj):
        return obj.get_full_name

    def get_profile_image_url(self, obj):
        request = self.context.get("request")
        if obj.profile_image:
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None
