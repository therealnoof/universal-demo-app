"""
Database migration script to add categories and video_categories tables
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'app.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Create categories table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY,
                name VARCHAR NOT NULL UNIQUE,
                order_position INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create video_categories association table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS video_categories (
                video_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                PRIMARY KEY (video_id, category_id),
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        """)

        conn.commit()
        print("✓ Migration successful! Categories tables created.")
        print("✓ You can now create and assign categories.")

    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
