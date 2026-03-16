from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'verification_status', 'avatar_url', 'phone_number',
            'preferred_language', 'university', 'study_program',
            'study_start_date', 'study_end_date', 'budget_min', 'budget_max',
            'company_name', 'total_listings', 'avg_rating', 'response_rate',
            'response_time_hours', 'created_at'
        ]
        read_only_fields = [
            'id', 'total_listings', 'avg_rating', 'response_rate',
            'response_time_hours', 'created_at'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role', 'phone_number',
            'university', 'study_program', 'company_name'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        
        # Validate role-specific fields
        if attrs['role'] == 'student':
            if not attrs.get('university'):
                raise serializers.ValidationError({"university": "University is required for students."})
        elif attrs['role'] == 'owner':
            if not attrs.get('company_name'):
                attrs['company_name'] = f"{attrs['first_name']} {attrs['last_name']}"
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'verification_status', 'avatar_url', 'phone_number',
            'preferred_language', 'university', 'study_program',
            'study_start_date', 'study_end_date', 'budget_min', 'budget_max',
            'company_name', 'total_listings', 'avg_rating', 'response_rate',
            'response_time_hours'
        ]
        read_only_fields = [
            'id', 'username', 'role', 'verification_status',
            'total_listings', 'avg_rating', 'response_rate',
            'response_time_hours'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
