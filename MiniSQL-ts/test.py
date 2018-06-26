import random
file = open("test2.sql", "w+")
for i in range(100000, 0, -1):
    file.write("insert into a values(" + str(random.randint(0, 1000000)) + ", " + str(random.randint(0, 1000000)) + ");\n");