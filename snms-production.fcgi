#!/usr/bin/python3
from flup.server.fcgi import WSGIServer
from snms.__main__ import app

if __name__ == '__main__':
    WSGIServer(app, debug=True).run()
