from __future__ import print_function, unicode_literals

import click
from werkzeug.security import generate_password_hash

from snms.cli.core import cli_group
from snms.const import ROLE_ADMIN
from snms.core.db import db
from snms.modules.companies import CompanyUserAssociation
from snms.modules.users import User
from snms.modules.companies import Company
from snms.utils.console import cformat, prompt_email, prompt_pass
from snms.utils.crypto import generate_uid, generate_key


click.disable_unicode_literals_warning = True


@cli_group()
def cli():
    pass


def _print_user_info(user):
    print()
    print('User info:')
    print("  ID: {}".format(user.uid))
    print("  Name: {}".format(user.name))
    print("  Email: {}".format(user.email))
    for company in user.own_companies:
        print("  Company: {}".format(company.name))
    print()


def _safe_lower(s):
    return (s or '').lower()


@cli.command()
@click.option('--admin/--no-admin', '-a/', 'grant_admin', is_flag=True, help='Grant admin rights')
@click.option('--company/--no-company', '-c/', 'create_company', is_flag=True, help='Create Company for User')
def create(grant_admin, create_company):
    """Creates a new user"""
    user_type = 'user' if not grant_admin else 'super_admin'
    while True:
        email = prompt_email()
        if email is None:
            return
        email = email.lower()
        if not User.query.filter(User.email == email).count():
            break
        print(cformat('%{red}Email already exists'))
    name = click.prompt("Name").strip()
    print()
    password = prompt_pass()
    if password is None:
        return

    user = User(uid=generate_uid(), email=email, name=name, role=user_type, password=generate_password_hash(password), is_verified = True)

    if create_company:
        company_name = click.prompt("Company Name").strip()
        company = Company(name=company_name, uid=generate_uid(), key=generate_key())
        user_company = CompanyUserAssociation(role=ROLE_ADMIN)
        user_company.user = user
        company.users.append(user_company)
        user.own_companies.append(company)
        db.session.add(company)

    _print_user_info(user)

    if click.confirm(cformat("%{yellow}Create the new {}?").format(user_type), default=True):
        db.session.add(user)
        db.session.commit()
        print(cformat("%{green}New {} created successfully with ID: %{green!}{}").format(user_type, user.uid))


@cli.command()
@click.argument('user_id', type=int)
def grant_admin(user_id):
    """Grants administration rights to a given user"""
    user = User.get(user_id)
    if user is None:
        print(cformat("%{red}This user does not exist"))
        return
    _print_user_info(user)
    if user.role == ROLE_ADMIN:
        print(cformat("%{yellow}This user already has administration rights"))
        return
    if click.confirm(cformat("%{yellow}Grant administration rights to this user?")):
        user.role = ROLE_ADMIN
        db.session.commit()
        print(cformat("%{green}Administration rights granted successfully"))


@cli.command()
@click.argument('user_id', type=int)
def revoke_admin(user_id):
    """Revokes administration rights from a given user"""
    user = User.get(user_id)
    if user is None:
        print(cformat("%{red}This user does not exist"))
        return
    _print_user_info(user)
    if not user.is_admin:
        print(cformat("%{yellow}This user does not have administration rights"))
        return
    if click.confirm(cformat("%{yellow}Revoke administration rights from this user?")):
        user.role = 'user'
        db.session.commit()
        print(cformat("%{green}Administration rights revoked successfully"))
