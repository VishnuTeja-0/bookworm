extern crate directories;

use rusqlite::{Connection, Result};
use directories::{BaseDirs, ProjectDirs};
use std::path::{Path,PathBuf};

const DB_NAME: &str = "pages.db";

#[derive(Debug)]
pub struct Page{
    pub id: u32,
    pub name: String,
    pub link: String,
    pub description: String,
    pub category: String
}

pub fn get_db_path() -> PathBuf {
    let db_path: PathBuf = if let Some(proj_dirs) = BaseDirs::new(){
        let root: &Path = proj_dirs.data_local_dir();
        root.join(DB_NAME)  
    }
    else{
        PathBuf::from(&DB_NAME)
    };

    db_path
}

pub fn create_database() -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "CREATE TABLE IF NOT EXISTS pages(
            id integer primary key,
            name text not null,
            link text not null,
            desc text,
            category text
        );",
        ()
    )?;

    Ok(())
}

pub fn get_entries() -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.id, p.name, p.link, p.desc, p.category from pages p"
    )?;

    let pages_iter = stmt.query_map([], |row| {
        Ok(
            Page{
                id: row.get(0)?,
                name: row.get(1)?,
                link: row.get(2)?,
                description: row.get(3)?,
                category: row.get(4)?,
            }
        )
    })?;
    for page in pages_iter{
        println!("Page {:?}", page.unwrap());
    }

    Ok(())
}

pub fn create_entry(page: Page) -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "INSERT INTO pages (name, link, desc, category) VALUES (?1, ?2, ?3, ?4)", 
        (&page.name, &page.link, &page.description, &page.category)
    )?;

    Ok(())  
}