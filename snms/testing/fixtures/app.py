import pytest

from snms.web.app import make_app


@pytest.fixture(scope='session')
def app():
    """Creates the flask app"""
    return make_app(set_path=True, testing=True)


@pytest.fixture(autouse=True)
def app_context(app):
    """Creates a flask app context"""
    with app.app_context():
        yield app


@pytest.fixture
def request_context(app_context):
    """Creates a flask request context"""
    with app_context.test_request_context():
        yield
