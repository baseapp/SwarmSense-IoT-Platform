import pytest

from snms.modules.users import User
from snms.utils.crypto import generate_uid


@pytest.fixture
def create_user(db):
    """Returns a callable which lets you create dummy users"""
    def _create_user(id_, uid=None, name='Gopal', admin=False, email=None):
        user = User.get(id_)
        if user:
            return user
        user = User()
        user.id = id_
        user.uid = uid if uid else generate_uid()
        user.name = name
        user.email = email or '{}@example.com'.format(id_)
        user.role = 'super_admin' if admin else 'user'
        db.session.add(user)
        db.session.flush()
        db.session.flush()
        return user

    return _create_user


@pytest.fixture
def dummy_user(create_user):
    """Creates a mocked user"""
    return create_user(8123)
