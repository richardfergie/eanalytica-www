import csv

def readFile(fname):
    with open(fname, newline='') as f:
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
