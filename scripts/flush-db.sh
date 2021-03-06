#!/usr/bin/env sh

MONGO_HOST="localhost"
SOLR_HOST="localhost"

# MongoDB
echo "Flushing MongoDB: $1 \t\c"
mongo $MONGO_HOST:27017/$1 --quiet --eval "db.dropDatabase();" > /dev/null
if [ $? -ne 0 ]
then
	echo "\007FAILED"
else
	echo "DONE"
fi