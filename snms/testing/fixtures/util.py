import inspect
import pytest


@pytest.fixture
def monkeypatch_methods(monkeypatch):
    """Monkeypatches all methods from `cls` onto `target`

    This utility lets you easily mock multiple methods in an existing class.
    In case of classmethods the binding will not be changed, i.e. `cls` will
    keep pointing to the source class and not the target class.
    """

    def _monkeypatch_methods(target, cls):
        for name, method in inspect.getmembers(cls, inspect.ismethod):
            if method.im_self is None:
                # For unbound methods we need to copy the underlying function
                method = method.im_func
            monkeypatch.setattr('{}.{}'.format(target, name), method)

    return _monkeypatch_methods

