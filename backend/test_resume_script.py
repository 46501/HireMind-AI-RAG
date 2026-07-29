import requests

url = "http://127.0.0.1:8000/api/v1/analyze/resume"

with open("test_upload.txt", "w") as f:
    f.write("This is a dummy resume text. Software Engineer with 10 years experience.")

with open("test_upload.txt", "rb") as f:
    files = {"resume": ("test_upload.txt", f, "text/plain")}
    # no jd
    response = requests.post(url, files=files)

print(response.status_code)
print(response.json())
