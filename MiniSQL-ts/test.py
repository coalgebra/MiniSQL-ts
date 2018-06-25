file = open("test2.sql", "w+")
for i in range(100000, 0, -1):
    file.write("insert into a values(" + str(i) + ", " + str(i) + ");\n");