from rest_framework.permissions import BasePermission,SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
  """
  Safe metódusok bárkinek engedettek.
  Író műveletek csak a tulajdonosnak.
  """

  def has_object_permission(self,request,view,obj):
    if request.method in SAFE_METHODS:
      return True
    
    return request.user.is_authenticated and obj.owner == request.user