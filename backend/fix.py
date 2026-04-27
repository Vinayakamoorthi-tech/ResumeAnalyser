# fix_db.py
import sqlite3
conn = sqlite3.connect('app.db')
conn.execute("ALTER TABLE resumes ADD COLUMN created_at DATETIME DEFAULT NULL")
conn.commit()
conn.close()
print('Done')