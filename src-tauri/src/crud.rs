extern crate directories;

use rusqlite::{Connection, Result};
use directories::{BaseDirs, ProjectDirs};
use serde::{Deserialize, Serialize};
use core::fmt;
use std::path::{Path,PathBuf};
use std::fs;

const APP_FOLDER_NAME: &str = "bookworm";
const DB_NAME: &str = "pages.db";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Page{
    pub id: u32,
    pub name: String,
    pub url: String,
    pub description: String,
    pub category: String
}

impl fmt::Display for Page {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Page -> {{ id: {}, name: {}, category: {}}}", self.id, self.name, self.category)
    }
}

pub fn get_db_path() -> PathBuf {
    let db_path: PathBuf = if let Some(proj_dirs) = BaseDirs::new(){
        let root: &Path = proj_dirs.data_local_dir();
        root.join(&APP_FOLDER_NAME).join(&DB_NAME)  
    }
    else{
        let root = PathBuf::from(&APP_FOLDER_NAME);
        root.join(&DB_NAME)
    };

    if let Some(parent_dir) = db_path.parent() {
        if !parent_dir.exists() {
            fs::create_dir_all(parent_dir).expect("Failed to create the application folder.");
        }
    }

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

pub fn get_entries() -> Result<Vec<Page>>{
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.id, p.name, p.link, p.desc, p.category FROM pages p
        ORDER BY p.category, p.id"
    )?;

    let pages_iter = stmt.query_map([], |row| {
        Ok(
            Page{
                id: row.get(0)?,
                name: row.get(1)?,
                url: row.get(2)?,
                description: row.get(3)?,
                category: row.get(4)?,
            }
        )
    })?;

    let mut pages: Vec<Page> = Vec::new();
    for page in pages_iter{
        pages.push(page?);
    }

    Ok(pages)
}

pub fn get_category_urls(category: &str) -> Result<Vec<String>> {
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.link FROM pages p
        WHERE p.category = :category;"
    )?;

    let links_iter = stmt.query_map([category], |row|{
        Ok(
            row.get(0)?
        )
    })?;

    let mut links: Vec<String> = Vec::new();
    for link in links_iter{
        links.push(link?);
    }

    Ok(links)
}

pub fn get_entry(id: u32) -> Result<Page> {
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.name, p.link, p.desc, p.category FROM pages p
        WHERE p.id = :id;"
    )?;

    let page: Page = stmt.query_row([id], |row| {
        Ok(
            Page{
                id,
                name: row.get(0)?,
                url:  row.get(1)?,
                description: row.get(2)?,
                category: row.get(3)?
            }
        )
    })?;
    
    Ok(page)
}

pub fn create_entry(page: Page) -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "INSERT INTO pages (name, link, desc, category) VALUES (?1, ?2, ?3, ?4)", 
        (&page.name, &page.url, &page.description, &page.category)
    )?;

    Ok(())  
}

pub fn edit_entry(id: u32, page: Page) -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "UPDATE pages 
        SET name = ?1, 
            link = ?2, 
            desc = ?3, 
            category = ?4
        WHERE pages.id = ?5", 
        (&page.name, &page.url, &page.description, &page.category, &id)
    )?;

    Ok(())
}

pub fn delete_entry(id: u32) -> Result<()>{
    let connection = Connection::open(get_db_path())?;

    connection.execute("DELETE from pages WHERE id = ?",[&id])?;

    Ok(())
}