ALTER TABLE blog_posts 
ALTER COLUMN author DROP NOT NULL;

INSERT INTO blog_posts (title, content, category, status)
VALUES 
	('How To Fry Unripe Plantain', 'frying platain is a sweet experience provided you will not eat it finish before frying', 1, 'unpublished'),
	('How to plan successful coups', 'the key to planning a successful coup is to have a breakfast meeting with Olusegun Falodun', 4, 'draft'),
	('Future Fashion Trends', 'Sip some tea with Aina as she discusses possible future fashion trends', 5, 'published'),
	('Why Enterprise Is The Best Star Trek Series', 'Star trek enterprise was widely disliked by long time fans of the franchise when it first came out in 2001', 2, 'published'),
	('Effect of Religion on IQ', 'Here we will discuss just how much subscruibing to religious beliefs and dogma affects omnes IQ and ability to think critically', 9,'archived');
	
UPDATE blog_posts 
SET is_published = true
WHERE status = 'published';
