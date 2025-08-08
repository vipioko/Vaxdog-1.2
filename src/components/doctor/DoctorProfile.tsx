import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Save,
  Camera,
  Stethoscope,
  Award,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { toast } from 'sonner';

const DoctorProfile = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useDoctorProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualification: '',
    clinicName: '',
    clinicAddress: '',
    bio: '',
    consultationFee: 0
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialization || '',
        experience: profile.experience || '',
        qualification: profile.qualification || '',
        clinicName: profile.clinicName || '',
        clinicAddress: profile.clinicAddress || '',
        bio: profile.bio || '',
        consultationFee: profile.consultationFee || 0
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialization || '',
        experience: profile.experience || '',
        qualification: profile.qualification || '',
        clinicName: profile.clinicName || '',
        clinicAddress: profile.clinicAddress || '',
        bio: profile.bio || '',
        consultationFee: profile.consultationFee || 0
      });
    }
    setIsEditing(false);
  };

  const getUserName = () => {
    if (profile?.name) return profile.name;
    if (user?.displayName) return user.displayName;
    if (user?.phoneNumber) {
      const lastFour = user.phoneNumber.slice(-4);
      return `Dr. ${lastFour}`;
    }
    return 'Doctor';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-700 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-blue-500/30">
                  <AvatarImage src={profile?.profileImage} />
                  <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xl font-bold">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{getUserName()}</h2>
                <p className="text-slate-400">{user?.phoneNumber}</p>
                {profile?.specialization && (
                  <div className="flex items-center gap-1 mt-1">
                    <Stethoscope className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">{profile.specialization}</span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "bg-blue-500 hover:bg-blue-600"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization" className="text-white">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Small Animal Medicine"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="experience" className="text-white">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5 years"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="qualification" className="text-white">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., BVSc & AH, MVSc"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicName" className="text-white">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="e.g., Happy Paws Clinic"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="consultationFee" className="text-white">Consultation Fee (₹)</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    placeholder="500"
                    min="0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clinicAddress" className="text-white">Clinic Address</Label>
                <Textarea
                  id="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                  placeholder="Full clinic address..."
                  rows={2}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your experience and approach to veterinary care..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Email</span>
                  </div>
                  <p className="text-white">{formData.email || 'Not provided'}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Phone</span>
                  </div>
                  <p className="text-white">{user?.phoneNumber || 'Not provided'}</p>
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Specialization</span>
                  </div>
                  <p className="text-white">{formData.specialization || 'Not specified'}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Experience</span>
                  </div>
                  <p className="text-white">{formData.experience || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Qualification</span>
                </div>
                <p className="text-white">{formData.qualification || 'Not provided'}</p>
              </div>

              {/* Clinic Info */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <h4 className="font-medium text-white">Clinic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Clinic Name</span>
                    </div>
                    <p className="text-white">{formData.clinicName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Consultation Fee</span>
                    </div>
                    <p className="text-white">₹{formData.consultationFee || 0}</p>
                  </div>
                </div>
                
                {formData.clinicAddress && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Clinic Address</span>
                    </div>
                    <p className="text-white">{formData.clinicAddress}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              {formData.bio && (
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Professional Bio</span>
                  </div>
                  <p className="text-white leading-relaxed">{formData.bio}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfile;