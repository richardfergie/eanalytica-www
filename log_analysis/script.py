import csv
import boto3
from datetime import date
from datetime import timedelta
import gzip

cloudfront_distribution="E3P1T4XH8X2KWN"

def downloadFiles(days=30):
    s3 = boto3.resource('s3')
    bucket = s3.Bucket('com.eanalytica.logs')
    today = date.today().strftime("%Y-%m-%d")
    daysago30 = date.today() - timedelta(days=30)
    daysago30 = daysago30.strftime("%Y-%m-%d")
    acc = []
    for file in bucket.objects.all():
        if (file.key[0:27]<(cloudfront_distribution+'.'+today) and file.key[0:27]>=(cloudfront_distribution+'.'+daysago30)):
            with open(file.key, 'wb') as f:
              bucket.download_fileobj(file.key,f)
              acc.append(file.key)
    return(acc)



def readFile(fname):
    with gzip.open(fname,'rt') as f:
        reader = csv.reader(f,delimiter='\t')
        next(reader)
        next(reader)
        acc = []
        for row in reader:
            x = {'date': row[0],
                 'time': row[1],
                 'ip': row[4],
                 'method': row[5],
                 'uri': row[7],
                 'status': row[8],
                 'referrer': row[9],
                 'useragent': row[10]
            }
            acc.append(x)
        return(acc)

def loadLogs(days=30):
    files = downloadFiles(days=days)
    logs = []
    for f in files:
        l = readFile(f)
        logs = logs + l
    return(logs)
