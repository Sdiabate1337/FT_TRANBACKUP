from django.shortcuts import render

# Create your views here.
from friendship.models import FriendshipRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from friendship.models import Friend ,FriendshipRequest,Block
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model







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


class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        friendships = Friend.objects.filter(
            Q(from_user_id=user.id) | Q(to_user_id=user.id)
        )

        friend_users = []
        for friendship in friendships:
            if friendship.from_user_id == user.id:
                friend_id = friendship.to_user_id
            else:
                friend_id = friendship.from_user_id

            try:
                friend = User.objects.get(id=friend_id)
                friend_users.append(friend)
            except User.DoesNotExist:
                continue 
        friend_data = [
            {
                "id": friend.id,
                "username": friend.username,
                "full_name": f"{friend.first_name} {friend.last_name}",
                "profile_picture": (
                    friend.profile.profile_picture.url
                    if hasattr(friend, 'profile') and friend.profile.profile_picture
                    else None
                ),
            }
            for friend in friend_users
        ]

        return Response({"friends": friend_data})


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


