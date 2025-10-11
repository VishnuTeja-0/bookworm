extern crate directories;

use core::fmt;
use directories::{BaseDirs, ProjectDirs};
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

const APP_FOLDER_NAME: &str = "bookworm";
const DB_NAME: &str = "bookworm.db";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Page {
    pub id: u32,
    pub name: String,
    pub url: String,
    pub description: String,
    pub category_id: u32,
}

impl fmt::Display for Page {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Page -> {{ id: {}, name: {}, category: {}}}",
            self.id, self.name, self.category_id
        )
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub parent_id: Option<u32>,
}

impl fmt::Display for Category {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Category -> {{ id: {}, name: {}, parent_id: {:?} }}",
            self.id, self.name, self.parent_id
        )
    }
}

pub fn get_db_path() -> PathBuf {
    let db_path: PathBuf = if let Some(proj_dirs) = BaseDirs::new() {
        let root: &Path = proj_dirs.data_local_dir();
        root.join(&APP_FOLDER_NAME).join(&DB_NAME)
    } else {
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

pub fn create_database() -> Result<()> {
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "CREATE TABLE IF NOT EXISTS categories(
            id integer primary key,
            name text not null,
            desc text,
            parent_id integer references categories(id) on delete cascade
        );",
        (),
    )?;

    connection.execute(
        "CREATE TABLE IF NOT EXISTS pages(
            id integer primary key,
            name text not null,
            link text not null,
            desc text,
            category_id integer not null references categories(id) on delete cascade,
        );",
        (),
    )?;

    Ok(())
}

pub fn get_categories() -> Result<Vec<Category>> {
    let connection = Connection::open(get_db_path())?;

    let mut categories_stmt = connection.prepare(
        "SELECT c.id, c.name, c.desc, c.parent_id FROM categories c
        ORDER BY c.id",
    )?;

    let categories_iter = categories_stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            parent_id: row.get(3)?,
        })
    })?;

    let mut categories: Vec<Category> = Vec::new();
    for category in categories_iter {
        categories.push(category?);
    }

    Ok(categories)
}

pub fn get_pages() -> Result<Vec<Page>> {
    let connection = Connection::open(get_db_path())?;
    
    let mut pages_stmt = connection.prepare(
        "SELECT p.id, p.name, p.link, p.desc, p.category_id FROM pages p
        ORDER BY p.category_id, p.id",
    )?;

    let pages_iter = pages_stmt.query_map([], |row| {
        Ok(Page {
            id: row.get(0)?,
            name: row.get(1)?,
            url: row.get(2)?,
            description: row.get(3)?,
            category_id: row.get(4)?,
        })
    })?;

    let mut pages: Vec<Page> = Vec::new();
    for page in pages_iter {
        pages.push(page?);
    }

    Ok(pages)
}

pub fn get_category_urls(category: &str) -> Result<Vec<String>> {
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.link FROM pages p
        WHERE p.category = :category;",
    )?;

    let links_iter = stmt.query_map([category], |row| Ok(row.get(0)?))?;

    let mut links: Vec<String> = Vec::new();
    for link in links_iter {
        links.push(link?);
    }

    Ok(links)
}

pub fn get_entry(id: u32) -> Result<Page> {
    let connection = Connection::open(get_db_path())?;

    let mut stmt = connection.prepare(
        "SELECT p.name, p.link, p.desc, p.category_id FROM pages p
        WHERE p.id = :id;",
    )?;

    let page: Page = stmt.query_row([id], |row| {
        Ok(Page {
            id,
            name: row.get(0)?,
            url: row.get(1)?,
            description: row.get(2)?,
            category_id: row.get(3)?,
        })
    })?;

    Ok(page)
}

pub fn create_entry(page: Page) -> Result<()> {
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "INSERT INTO pages (name, link, desc, category_id) VALUES (?1, ?2, ?3, ?4)",
        (&page.name, &page.url, &page.description, &page.category_id),
    )?;

    Ok(())
}

pub fn edit_entry(id: u32, page: Page) -> Result<()> {
    let connection = Connection::open(get_db_path())?;

    connection.execute(
        "UPDATE pages 
        SET name = ?1, 
            link = ?2, 
            desc = ?3, 
            category_id = ?4
        WHERE pages.id = ?5",
        (
            &page.name,
            &page.url,
            &page.description,
            &page.category_id,
            &id,
        ),
    )?;

    Ok(())
}

pub fn delete_entry(id: u32) -> Result<()> {
    let connection = Connection::open(get_db_path())?;

    connection.execute("DELETE from pages WHERE id = ?", [&id])?;

    Ok(())
}
