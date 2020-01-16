import csv
import boto3
from datetime import date
from datetime import timedelta
import gzip
import pandas as pd
from user_agents import parse

cloudfront_distribution="E3P1T4XH8X2KWN"
s3 = boto3.resource('s3')
logbucket = s3.Bucket('com.eanalytica.logs')

def downloadFiles(days=30):
    today = date.today().strftime("%Y-%m-%d")
    daysago30 = date.today() - timedelta(days=30)
    daysago30 = daysago30.strftime("%Y-%m-%d")
    acc = []
    for file in logbucket.objects.all():
        if (file.key[0:27]<(cloudfront_distribution+'.'+today) and file.key[0:27]>=(cloudfront_distribution+'.'+daysago30)):
            with open('/tmp/'+file.key, 'wb') as f:
              logbucket.download_fileobj(file.key,f)
              acc.append('/tmp/'+file.key)
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
                 'useragent': row[10],
                 'host': row[15],
                 'protocol': row[16]
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

def lambda_handler(event, context):
    logs = loadLogs(days=30)
    with open('/tmp/logs.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        write.writerow(['date','method','uri','status','parsed_ua','url'])
        for row in logs:
            row['parsed_ua'] = str(parse(row['useragent']))
            row['url'] = row['protocol'] + "://" + row['host'] + row['uri']
            writer.writerow([row['date'],
                             row['method'],
                             row['uri'],
                             row['status'],
                             row['parsed_ua'],
                             row['url']
            ])
    s3.Bucket("com.eanalytica.www2").upload_file("/tmp/logs.csv","logs/logs.csv")
