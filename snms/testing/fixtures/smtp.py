import pytest

from snms.core.config import config


@pytest.fixture
def smtp(disallow_emails, smtpserver):
    """Wrapper for the `smtpserver` fixture which updates the SNMS config
    and disables the SMTP autofail logic for that smtp server.
    """
    # old_smtp_server = Config.getInstance().getSmtpServer()
    # Config.getInstance().update(SmtpServer=smtpserver.addr)
    # disallow_emails.add(smtpserver.addr)  # whitelist our smtp server
    # yield smtpserver
    # Config.getInstance().update(SmtpServer=old_smtp_server)
