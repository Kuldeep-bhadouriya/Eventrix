#!/bin/bash

# Load .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# Run Prisma Studio with DATABASE_URL
npx prisma studio "$@"
