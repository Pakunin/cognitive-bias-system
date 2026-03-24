from memory.db import init_db

def main():

    init_db()   # ensures DB exists

    print("System ready")

    # later your pipeline runs here


if __name__ == "__main__":
    main()