use reqwest::Client;
use scraper::{ElementRef, Html, Selector};
use std::{error::Error, result};
use once_cell::sync::Lazy;
use std::time::Duration;
use futures::future::join_all;

pub static HTTP_CLIENT: Lazy<reqwest::blocking::Client> = Lazy::new(|| {
    reqwest::blocking::Client::builder()
         .user_agent("bookworm/1.0")   
         .timeout(Duration::from_secs(10))
         .build()
         .expect("Failed to create HTTP client")
});

async fn extract_site_text(client: &Client, url: &str) -> Result<String, Box<dyn Error>> {
   let html = client.get(url).send().await?.text().await?;
   let document = Html::parse_document(&html);

   let mut fragments: Vec<String> = Vec::new();

   let selectors = [
      "article",
      "main",
      "[role=main]",
      "[itemprop=articleBody]",
      "div[class*=content]",
      "div[class*=article]",
      "div[class*=main]",
      "#content",
      ".post",
      "body",
   ];

   for selector_str in selectors.iter(){
      if let Ok(selector) = Selector::parse(selector_str){
         for node in document.select(&selector){
            let collected_text  = collect_element_text(&node);
            if !collected_text.is_empty(){
               fragments.push(collected_text);
            }
         };
      }
   }

   let fallback_selector = Selector::parse("div")?;
   for div in document.select(&fallback_selector){
      let collected_text  = collect_element_text(&div);
      if !collected_text.is_empty(){
         fragments.push(collected_text);
      }
   }

   Ok(fragments.join("\n\n"))
}

pub async fn batch_extract_site_text(urls: Vec<String>) -> Result<Vec<String>, Box<dyn Error>> {
   let client = reqwest::Client::new();

   let tasks = urls.iter().map(|url| {
      let client = client.clone();
      let url_clone = url.clone();
      tokio::spawn(async move {
         extract_site_text(&client, &url_clone)
         .await
         .map_err(|e| format!("Failed to extract text from {}: {}", url_clone, e))
      })
   });

   let results = join_all(tasks).await;
   let mut extracted_texts = Vec::new();

   for res in results {
      match res {
         Ok(Ok(text)) => extracted_texts.push(text),
         Err(e) => return Err(e.into()),
         _ => {}
      }
   }

   Ok(extracted_texts)
}

fn collect_element_text(node: &ElementRef<'_>) -> String{
   let text = node.text().collect::<Vec<_>>().join(" ");
   let word_count = text.split_whitespace().count();
   if word_count >= 100{
      return text.trim().to_string();
   }

   String::new()
}