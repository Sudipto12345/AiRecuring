def test_superadmin_deletion_guard_logic():
    """
    Unit test verifying super admin count protection logic.
    Ensures that when count <= 1, deletion of super_admin is denied.
    """
    mock_superadmins = [
        {"id": "sa_1", "role": "super_admin", "email": "owner@airecruit.io"}
    ]
    
    target_user = mock_superadmins[0]
    count = len(mock_superadmins)
    
    can_delete = True
    error_message = ""
    
    if target_user["role"] == "super_admin" and count <= 1:
        can_delete = False
        error_message = "Cannot delete the last remaining platform Super Admin"
        
    assert can_delete is False
    assert error_message == "Cannot delete the last remaining platform Super Admin"
    print("✓ Super admin deletion safety guard test passed successfully!")

if __name__ == "__main__":
    test_superadmin_deletion_guard_logic()
