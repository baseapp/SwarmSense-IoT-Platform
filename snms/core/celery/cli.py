from __future__ import unicode_literals

import os
import sys

from celery.bin.celery import CeleryCommand, command_classes

from snms.core.celery import celery
from snms.core.config import config
from snms.utils.console import cformat


def celery_cmd(args):
    # remove the celery shell command
    next(funcs for group, funcs, _ in command_classes if group == 'Main').remove('shell')
    del CeleryCommand.commands['shell']

    if args and args[0] == 'flower':
        # Somehow flower hangs when executing it using CeleryCommand() so we simply exec it directly.
        # It doesn't really need the celery config anyway (besides the broker url)

        try:
            import flower
        except ImportError:
            print(cformat('%{red!}Flower is not installed'))
            sys.exit(1)

        auth_args = ['--auth=user@gmail.com', '--auth_provider=flower.views.auth.GithubLoginHandler']
        auth_env = {'FLOWER_OAUTH2_KEY': '',
                    'FLOWER_OAUTH2_SECRET': '',
                    'FLOWER_OAUTH2_REDIRECT_URI': 'http://localhost:5555/login'
                    }

        args = ['celery', '-b', config.CELERY_BROKER] + args
        env = dict(os.environ, **auth_env)
        os.execvpe('celery', args, env)
    elif args and args[0] == 'shell':
        print(cformat('%{red!}Please use `snms shell`.'))
        sys.exit(1)
    else:
        CeleryCommand(celery).execute_from_commandline(['snms celery'] + args)
