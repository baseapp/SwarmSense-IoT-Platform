FROM python:3.4
ADD ./swarmsense /swarmsense
WORKDIR /swarmsense
RUN set -ex && apt-get update && apt-get install -y libpq-dev python-dev
RUN pip install -r requirements.txt --no-build-isolation
RUN pip install swarmsense.tar.gz
CMD gunicorn -b 0.0.0.0:8000 -w 4 snms.__main__:app
