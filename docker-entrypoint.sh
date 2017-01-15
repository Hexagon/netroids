#!/bin/sh

set -e

cp -R /usr/src/app/client/* /usr/src/app/public/

exec "$@"
