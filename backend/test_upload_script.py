import requests

url = "http://127.0.0.1:8000/api/v1/upload/knowledge"

with open("test_upload.txt", "rb") as f:
    files = {"file": ("test_upload.txt", f, "text/plain")}
    data = {"category": "general"}
    response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.json())
