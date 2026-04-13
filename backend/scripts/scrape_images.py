# pip install icrawler

import os
from icrawler.builtin import BingImageCrawler, GoogleImageCrawler

def scrape_wedding_decor():
    # 1. Keyword Strategy: High-variance search terms for wedding decor
    keywords = [
        'Indian wedding stage decor',
        'South Indian mandap decoration',
        'wedding reception floral backdrop',
        'Haldi ceremony decor',
        'modern minimalist wedding stage',
        'Mehndi ceremony decor',
        'Sangeet stage decoration',
        'Royal Rajasthani wedding decor',
        'Bohemian wedding mandap',
        'Outdoor wedding floral arch',
        'Wedding aisle decoration flowers',
        'Cocktail party decor ideas',
        'Vintage wedding theme decor',
        'Grand entrance wedding decor',
        'Temple style wedding mandap',
        'Forest theme wedding decor',
        'Whimsical floral wedding ceiling',
        'Contemporary Indian wedding decor',
        'Traditional Marwari wedding stage',
        'Beach wedding decor setup'
    ]

    # 2. Directory Management: Ensure the target directory exists
    target_dir = os.path.join('backend', 'dataset', 'raw_decor')
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created directory: {target_dir}")

    # 3. Loop & Download: Iterate through keywords
    # Using BingImageCrawler as Google's scraper can be more prone to CAPTCHAs without API keys
    # but icrawler's Bing crawler is quite robust for bulk downloads.
    
    for i, keyword in enumerate(keywords):
        print(f"\n--- Starting download for keyword ({i+1}/{len(keywords)}): {keyword} ---")
        
        # Sub-folder for each keyword to keep things organized if needed, 
        # or download directly into the main folder. 
        # The user asked to save into 'target directory', so we'll use a subfolder per keyword 
        # to avoid filename collisions and then merging is easy.
        keyword_dir = os.path.join(target_dir, keyword.replace(' ', '_').lower())
        if not os.path.exists(keyword_dir):
            os.makedirs(keyword_dir)

        # Set max_num=2000 per keyword to ensure we hit the 10,000+ total goal
        # Note: Search engines might cap results per query around 1000, 
        # but icrawler handles pagination to get as many as possible.
        crawler = BingImageCrawler(storage={'root_dir': keyword_dir})
        crawler.crawl(keyword=keyword, max_num=2000)

    print(f"\nScraping complete. Images saved to {target_dir}")

if __name__ == '__main__':
    scrape_wedding_decor()
