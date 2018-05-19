#!/usr/bin/env bash

LOG="installer.log"

log(){
    current="`date +"%Y-%m-%d %H:%M:%S"`"
    echo "$current :: $1" >> $LOG
    echo $1
}

log "Started installation"

#Absolute path to this script
SCRIPT=$(readlink -f $0)
#Absolute path this script is in
SCRIPTPATH=$(dirname $SCRIPT)

#check for root user
if [ "$(id -u)" -ne 0 ] ; then
	echo "You must run this script as root. Sorry!"
	exit 1
fi

RABBITMQ_VERSION=3.6.12
RABBITMQ_GITHUB_TAG=rabbitmq_v3_6_12
RABBITMQ_DEBIAN_VERSION=3.6.12-1

CELERY_BEAT_TMP_FILE="${SCRIPTPATH}/configs/celerybeat"
CELERYD_TMP_FILE="${SCRIPTPATH}/configs/celeryd"
CELERY_WORKER_TMP_FILE="${SCRIPTPATH}/configs/celeryd.conf"
SUPERVISOR_CONFIG_FILE="${SCRIPTPATH}/configs/supervisord.conf"
INFLUXDB_CONFIG_FILE="${SCRIPTPATH}/configs/influxdb.conf"
NGINX_CONF_TMP_FILE="${SCRIPTPATH}/configs/nginx"
SNMS_PATH="${SCRIPTPATH}/../"
SNMS_FCGI_SOCK_FILE="/opt/snms.sock"
SNMS_FCGI_TMP_FILE="${SCRIPTPATH}/../snms-production.fcgi"
SNMS_FCGI_DEST="/opt/snms/snms.fcgi"
SUPER_SNMS_CONF="${SCRIPTPATH}/configs/snms.conf"
SUPER_INIT="${SCRIPTPATH}/configs/supervisor"
SUPER_SNMS_MQTT_CONF="${SCRIPTPATH}/configs/mqtt.conf"

# Config file for rabbitmq
RABBITMQ_CONFIG="${SCRIPTPATH}/configs/rabbitmq.config"

SNMS_FRONTEND_ZIP="${SCRIPTPATH}/../frontend/swarmsense-ui.tar.bz2"

LOG_DIR="/opt/snms/log"
SECRET_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 18 | head -n 1)
FRONTEND_DIR="/var/www/snms"

CURRENT_DIR=$PWD

apt-get update
apt-get install -y build-essential tcl wget

install_postgres()
{
    log "Installing PostgreSql"
    apt-get install -y postgresql postgresql-contrib
    service postgresql start
}

install_influx()
{
    log "Installing InfluxDB"
    wget https://dl.influxdata.com/influxdb/releases/influxdb_1.3.6_amd64.deb
    dpkg -i influxdb_1.3.6_amd64.deb
    rm influxdb_1.3.6_amd64.deb
    service influxdb start
}

install_cassandra()
{
    log "Installing Cassandra..."
    echo "deb http://www.apache.org/dist/cassandra/debian 311x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
    curl https://www.apache.org/dist/cassandra/KEYS | sudo apt-key add -
    apt-key adv --keyserver pool.sks-keyservers.net --recv-key A278B781FE4B2BDA
    apt-get update
    apt-get install -y cassandra
    # while read a ; do echo ${a//AllowAllAuthenticator/PasswordAuthenticator} ; done < /etc/cassandra/cassandra.yaml > /etc/cassandra/cassandra.yaml.t ; mv /etc/cassandra/cassandra.yaml{.t,}
    # service cassandra restart
}

install_redis()
{
    wget http://download.redis.io/releases/redis-3.2.8.tar.gz
    tar xzf redis-3.2.8.tar.gz
    cd redis-3.2.8
    make
    make install
    cd utils
    ./install_server.sh
    cd ../../
    rm redis-3.2.8.tar.gz
    cd $CURRENT_DIR
}

install_nginx(){
    log "Installing Nginx"
    nginx -v
    if test $? -eq 0
    then
        log "Nginx is installed"
    else
        apt-get install -y nginx
    fi
    rm /etc/nginx/sites-enabled/default
}

install_postfix(){
    log "Installing postfix"
    apt-get install -y postfix
}

install_rabbitmq(){
    log "installing rabbitmq"
    apt-get install -y  erlang-asn1 erlang-crypto erlang-eldap erlang-inets erlang-mnesia erlang-nox erlang-os-mon erlang-public-key erlang-ssl erlang-xmerl socat
    wget -O rabbitmq-server.deb.asc "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server_${RABBITMQ_DEBIAN_VERSION}_all.deb.asc"
    wget -O rabbitmq-server.deb     "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server_${RABBITMQ_DEBIAN_VERSION}_all.deb"
    dpkg -i rabbitmq-server.deb
    rm -f rabbitmq-server.deb*
}

enable_rabbitmq(){
    rabbitmq-plugins enable rabbitmq_management
    rabbitmq-plugins enable rabbitmq_mqtt
    rabbitmq-plugins enable rabbitmq_web_mqtt
    mkdir -p /usr/lib/rabbitmq/plugins
    wget -O /usr/lib/rabbitmq/plugins/rabbitmq_auth_backend_http-3.6.12.ez https://dl.bintray.com/rabbitmq/community-plugins/rabbitmq_auth_backend_http-3.6.12.ez
    rabbitmq-plugins enable rabbitmq_auth_backend_http
}

install_nginx
install_postfix

# Check for psql
log "Checking PostgreSQL"
psql -V
status=$?

if test $status -eq 0
then
	log "PostgreSQL is already installed : OK"
else
	log "PostgreSQL is not installed we will install it."
	install_postgres
fi

#log "Checking Redis"
#if test `redis-cli ping` = "PONG"
#then
#	log "Redis is installed : OK"
#else
#	log "Redis is not installed we will install it."
#	install_redis
#fi

install_rabbitmq
enable_rabbitmq

case "$1" in
    cassandra)
        install_cassandra
        ;;

    *)
        # Check for influx
        log "Checking InfluxDB"
        influx -version
        influx_status=$?

        if test $influx_status -eq 0
        then
	        log "InfluxDB is already installed : OK"
        else
	        log "InfluxDB is not installed we will install it."
	        install_influx
        fi
        ;;

esac


log "Installing Supervisor...."

pip3 -V
if test $? -eq 0
then
	log "Python pip3 is installed"
else
	log "Python pip3 is not installed. we will install it."
    apt-get install -y python3-pip
fi

apt-get -f install -y
apt-get install -y python-setuptools

supervisord -v
if test $? -eq 0
then
	log "Supervisor is installed"
else
	log "Supervisor is not installed. we will install it."
    easy_install supervisor
fi

mkdir -p /etc/supervisor/conf.d
echo_supervisord_conf > /etc/supervisor/supervisord.conf

die () {
	log "ERROR: $1. Aborting!"
	exit 1
}

#################################################### DATABASE #################
log "Creating Database User and Database..."

PG_USER_DEFAULT="snms"
PG_HOST="localhost"
PG_PORT=5432
DB_PREFIX_DEFAULT="snms_"

read -p "Please select Postgres/Influx Database Username [$PG_USER_DEFAULT]: " PG_USER
PG_USER="${PG_USER:-$PG_USER_DEFAULT}"

read -p "Postgres Database Prefix [$DB_PREFIX_DEFAULT]: " DB_PREFIX
DB_PREFIX="${DB_PREFIX:-$DB_PREFIX_DEFAULT}"

PG_DB="${DB_PREFIX}data"
PG_DB_FILES="${DB_PREFIX}files"
PG_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)

INFLUX_PORT=8086
INFLUX_HOST="localhost"
INFLUX_USER="snms"
INFLUX_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
INFLUX_DB="snms"


INFLUX_USER="${PG_USER}"


create_database() {
    log "Creating Postgres User: $PG_USER"
    su - postgres -c "psql --command \"CREATE ROLE $PG_USER WITH CREATEDB LOGIN ENCRYPTED PASSWORD '$PG_PASSWORD'\""
    su - postgres -c "psql --command \"ALTER ROLE $PG_USER WITH PASSWORD '$PG_PASSWORD'\""

    log "Creating Postgres Database: $PG_DB and $PG_DB_FILES"
    su - postgres -c "psql --command \"CREATE DATABASE $PG_DB OWNER $PG_USER\""
    su - postgres -c "psql --command \"CREATE DATABASE $PG_DB_FILES OWNER $PG_USER\""

}

create_influx_database() {
    log "Creating InfluxDB User: $INFLUX_USER"
    influx -execute "CREATE USER $INFLUX_USER WITH PASSWORD '$INFLUX_PASSWORD' WITH ALL PRIVILEGES"
    influx -execute "SET PASSWORD FOR $INFLUX_USER = '$INFLUX_PASSWORD'"

    log "Creating InfluxDB Database: $INFLUX_DB"
    influx -execute "CREATE DATABASE $INFLUX_DB"

}

create_cassandra_database() {
    log "Creating Cassandra Keyspace and User"
    cqlsh -e "CREATE KEYSPACE IF NOT EXISTS $INFLUX_DB  WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 }"
    # cqlsh -e "CREATE ROLE $INFLUX_USER WITH PASSWORD = '$INFLUX_PASSWORD' AND LOGIN = true"
    # cqlsh -e "GRANT ALL PERMISSIONS on KEYSPACE $INFLUX_DB to $INFLUX_USER"
}

create_database

case "$1" in
    cassandra)
        create_cassandra_database
        ;;

    *)
        create_influx_database
        ;;

esac


#------------------------------------------------------------------------------------------


NGINX_SERVER_NAME_DEFAULT="localhost"
read -p "Nginx hostname eg : www.yourdomain.tld [$NGINX_SERVER_NAME_DEFAULT]: " NGINX_SERVER_NAME
NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-$NGINX_SERVER_NAME_DEFAULT}"



mkdir -p $LOG_DIR
mkdir -p  $FRONTEND_DIR

cp $SUPERVISOR_CONFIG_FILE /etc/supervisor/
cp $SUPER_INIT /etc/init.d/supervisor
chmod +x /etc/init.d/supervisor


case "$1" in
    cassandra)
        log "No config changes for cassandra"
        ;;

    *)
        cp $INFLUXDB_CONFIG_FILE /etc/influxdb/
        ;;

esac


create_config_celery_beat()
{
    log "Creating Celery Beat service file /etc/init.d/celerybeat"
    cp $CELERY_BEAT_TMP_FILE /etc/init.d/celerybeat
    chmod +x /etc/init.d/celerybeat
}

create_config_celery_worker()
{
    log "Creating Celery Worker config file at /etc/supervisor/conf.d/"
    cp $CELERY_WORKER_TMP_FILE /etc/supervisor/conf.d/
}

create_config_celeryd()
{
    cp $CELERYD_TMP_FILE /etc/default/
}

create_config_snms_fcgi()
{
    log "Creating FCGI Script File $SNMS_FCGI_DEST"
    cp $SNMS_FCGI_TMP_FILE $SNMS_FCGI_DEST
    chmod +x $SNMS_FCGI_DEST
    cp $SUPER_SNMS_CONF /etc/supervisor/conf.d/
}

create_config_rabbitmq()
{
    log "Creating rabbitmq configuration file"
    cp $RABBITMQ_CONFIG /etc/rabbitmq
    cp $SUPER_SNMS_MQTT_CONF /etc/supervisor/conf.d/
}


create_config_nginx()
{
    log "Creating Nginx Sever conf file"
    NGINX_SERVER_PORT=80
    NGINX_DIST="/etc/nginx/sites-available/snms"
    read -r SED_EXPR <<-EOF
    s/5000/${NGINX_SERVER_PORT}/;\
    s/localhost/${NGINX_SERVER_NAME}/;
EOF

    sed -r "$SED_EXPR" $NGINX_CONF_TMP_FILE > "${NGINX_DIST}"
    ln -s ${NGINX_DIST} /etc/nginx/sites-enabled/
}

create_snms_config(){
    log "Creating SNMS config at /etc/snms.conf"
    cat > /etc/snms.conf <<-EOF
# Configuration
SECRET_KEY = "${SECRET_KEY}"

CELERY_BROKER = 'amqp://guest:guest@localhost:5672'
CELERY_RESULT_BACKEND = 'amqp://guest:guest@localhost:5672'

SQLALCHEMY_DATABASE_URI = 'postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}'
SQLALCHEMY_DATABASE_FILES_URI = 'postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB_FILES}'
SQLALCHEMY_POOL_SIZE = 10

TSDB_HOST = '${INFLUX_HOST}'
TSDB_PORT = ${INFLUX_PORT}
TSDB_USERNAME = '${INFLUX_USER}'
TSDB_PASSWORD = '${INFLUX_PASSWORD}'
TSDB_DB = '${INFLUX_DB}'

# BASE_URL = 'http://${NGINX_SERVER_NAME}'
# Debug = True

TEMP_DIR = '/tmp'
LOG_DIR = '${LOG_DIR}'
LOGGERS = ['file']

MQTT_BROKER_URL = 'localhost'
MQTT_USERNAME = 'guest'
MQTT_PASSWORD = 'guest'
EOF

}

install_app(){
    log "Installing App"

    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8
    cd $SNMS_PATH
    pip3 install -r requirements.txt
    pip3 install snms.tar.gz
    log "Creating database tables and default data"
    snms db prepare
    log "Adding admin user for application."
    echo "Add Admin User:-"
    snms user create -a -c
}

install_frontend(){
    log "Installing frontend app at /var/www/snms/"
    cp $SNMS_FRONTEND_ZIP /var/www/snms/
    cd /var/www/snms/
    tar -xf swarmsense-ui.tar.bz2
    log "Adding API_URL to config.js"
    # echo "var API_URL = 'http://${NGINX_SERVER_NAME}/api'" > config.js
    rm swarmsense-ui.tar.bz2
}

start_services(){
    log "Restarting services..."
    service nginx reload
    service nginx start
    systemctl enable supervisor
    systemctl start supervisor
    /etc/init.d/celerybeat start
    supervisorctl reload
}

list_details(){
    echo "PostgreSQL User : $PG_USER"
    echo "PostgreSQL Password : $PG_PASSWORD"
    echo "InfluxDB User: $INFLUX_USER"
    echo "InfluxDB Password: $INFLUX_PASSWORD"
    echo "Checkout config file /etc/snms.conf for more configurations."

}

create_config_celery_beat
create_config_celery_worker
create_config_celeryd
create_config_nginx
create_snms_config
create_config_rabbitmq

install_frontend
install_app

log "Adding system user snms:www-data"
useradd -rm -g www-data -d /opt/snms -s /bin/bash snms
create_config_snms_fcgi

chown -R snms:www-data /opt/snms

start_services

log "Installation finished."

list_details

log "Browse http://$NGINX_SERVER_NAME to access the application."