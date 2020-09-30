import path from 'path'
import sqlite3 from "sqlite3"

let database;

class DBCommon {
    static init(base='./') {
        database = new sqlite3.Database(path.join(base, "user.sqlite3"))
    }
    static get() {
        return database;
    }
}

class Notebook {
    static async createTableIfNotExists() {
        const db = DBCommon.get();

        return new Promise((resolve, reject) => {
            try {
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS ${userTableName} (
                        account text primary key,
                        name text,
                        email text
                    )`)
                })
                return resolve()
            } catch (err) {
                return reject(err)
            }
        })
    }

    static async save(user) {
        const db = DBCommon.get()

        return new Promise((resolve, reject) => {
          try {
            db.run(`INSERT OR REPLACE INTO ${userTableName} 
                (account, name, email) 
                values ($account, $name, $email)`,
                user.account, user.name, user.email
            )
            return resolve()
          } catch (err) {
            return reject(err)
          }
        })
      }


}

export { Notebook }
