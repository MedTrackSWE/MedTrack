# Dockerfile for the backend
FROM python:3.9-slim
WORKDIR /app
# Copy the requirements and install dependencies
COPY ./backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
# Copy the backend app and test code
COPY ./backend/app /app/app
COPY ./backend/tests /app/tests
# Expose the Flask port
EXPOSE 5000
# Set environment variables if required
ENV FLASK_ENV=development
# Command to run your backend app (assuming app.py is inside app/)
CMD ["python", "app/app.py"]





