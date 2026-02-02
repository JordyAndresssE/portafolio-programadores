# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the JAR
COPY --from=builder /build/target/*.jar app.jar

# Create startup script that reads MYSQL_URL and converts it to Spring properties
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

# Use MYSQL_URL or DATABASE_URL
DB_URL="${MYSQL_URL:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: MYSQL_URL or DATABASE_URL must be set"
  exit 1
fi

# Extract connection details from mysql://user:password@host:port/database
DB_USER=$(echo "$DB_URL" | sed -E 's|mysql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DB_URL" | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DB_URL" | sed -E 's|mysql://[^@]+@([^:]+):.*|\1|')
DB_PORT=$(echo "$DB_URL" | sed -E 's|mysql://[^@]+@[^:]+:([^/]+)/.*|\1|')
DB_NAME=$(echo "$DB_URL" | sed -E 's|mysql://[^/]+/([^?]+).*|\1|')

# Build JDBC URL
JDBC_URL="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=America/Guayaquil&allowPublicKeyRetrieval=true"

echo "✅ Database configured: $DB_NAME on $DB_HOST:$DB_PORT"

# Start Spring Boot with environment variables
exec java -jar \
  -Dspring.datasource.url="$JDBC_URL" \
  -Dspring.datasource.username="$DB_USER" \
  -Dspring.datasource.password="$DB_PASS" \
  -Dserver.port=${PORT:-8080} \
  app.jar
EOF

RUN chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]
