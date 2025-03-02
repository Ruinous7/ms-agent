-- Insert question stages
INSERT INTO question_stages (step_number, title, description) VALUES
(1, 'זיהוי כללי של העסק', 'מידע בסיסי על העסק שלך'),
(2, 'תחום פעילות ומודל עסקי', 'איך העסק שלך פועל ובאיזה תחום'),
(3, 'קהלי יעד ונקודות כאב', 'מי הלקוחות שלך ומה הבעיות שהם מנסים לפתור'),
(4, 'מכירות ותמחור', 'איך אתה מוכר ומתמחר את השירותים שלך'),
(5, 'שיווק ותהליכים קיימים', 'איך אתה משווק ומנהל את העסק שלך'),
(6, 'פיננסים ותזרים', 'איך אתה מנהל את הכספים בעסק'),
(7, 'אתגרים מרכזיים וציפיות', 'מה חוסם אותך ומה אתה רוצה להשיג'),
(8, 'סיכום ואבחון ראשוני', 'סיכום והמלצות ראשוניות');

-- Insert option sets
INSERT INTO option_sets (name, description) VALUES
('BusinessStage', 'שלב העסק'),
('LegalStatus', 'מעמד משפטי'),
('NumEmployees', 'מספר עובדים'),
('BusinessModel', 'מודל עסקי'),
('Industry', 'תחום פעילות'),
('SalesMethod', 'שיטת מכירה'),
('ClientSource', 'מקור לקוחות'),
('IdealClient', 'לקוח אידיאלי'),
('ClientPainPoint', 'נקודות כאב של לקוחות'),
('ServiceDelivery', 'שיטת מתן שירות'),
('PricingMethod', 'שיטת תמחור'),
('AveragePrice', 'מחיר ממוצע'),
('MonthlyDeals', 'עסקאות חודשיות'),
('ContentMarketing', 'שיווק תוכן'),
('CRMUsage', 'שימוש ב-CRM'),
('FinancialTracking', 'מעקב פיננסי'),
('PaymentCollection', 'גביית תשלומים'),
('KeyChallenge', 'אתגרים מרכזיים'),
('AppExpectation', 'ציפיות מהאפליקציה');

-- Insert questions for Stage 1
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('What is your business name?', 'מה שם העסק שלך?', 1, 'free_text', 1, NULL, 'general', 1),
('What stage is your business in?', 'באיזה שלב העסק שלך נמצא?', 2, 'single_select', 1, 'BusinessStage', 'general', 1),
('What is your legal status?', 'מה המעמד המשפטי שלך?', 3, 'single_select', 1, 'LegalStatus', 'general', 1),
('How many employees do you have?', 'כמה עובדים יש לך?', 4, 'single_select', 1, 'NumEmployees', 'general', 1),
('How does your business currently operate?', 'איך העסק שלך פועל כרגע?', 5, 'single_select', 1, 'BusinessModel', 'general', 1);

-- Insert questions for Stage 2
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('What industry do you operate in?', 'באיזה תחום אתה פועל?', 6, 'single_select', 1, 'Industry', 'business_model', 2),
('How do you sell your services?', 'איך אתה מוכר את השירותים שלך?', 7, 'single_select', 1, 'SalesMethod', 'business_model', 2),
('How do customers currently reach you?', 'איך הלקוחות מגיעים אליך כרגע?', 8, 'multi_select', 2, 'ClientSource', 'business_model', 2);

-- Insert questions for Stage 3
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('Who is your ideal client?', 'מי הלקוח האידיאלי שלך?', 9, 'multi_select', 2, 'IdealClient', 'target_audience', 3),
('What problems do your clients want to solve?', 'מה הבעיות שהלקוחות שלך רוצים לפתור?', 10, 'multi_select', 2, 'ClientPainPoint', 'target_audience', 3),
('How do your clients prefer to receive service?', 'איך הלקוחות שלך מעדיפים לקבל שירות?', 11, 'single_select', 1, 'ServiceDelivery', 'target_audience', 3);

-- Insert questions for Stage 4
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('How do you price your services?', 'איך אתה מתמחר את השירותים שלך?', 12, 'single_select', 1, 'PricingMethod', 'sales', 4),
('What is the average price of your main service?', 'מה המחיר הממוצע של השירות העיקרי שלך?', 13, 'single_select', 1, 'AveragePrice', 'sales', 4),
('How many deals do you close per month on average?', 'כמה עסקאות אתה סוגר בחודש בממוצע?', 14, 'single_select', 1, 'MonthlyDeals', 'sales', 4);

-- Insert questions for Stage 5
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('What marketing content do you already produce?', 'איזה תוכן שיווקי אתה כבר מייצר?', 15, 'multi_select', 2, 'ContentMarketing', 'marketing', 5),
('Do you have a customer relationship management (CRM) system?', 'האם יש לך מערכת ניהול לקוחות (CRM)?', 16, 'single_select', 1, 'CRMUsage', 'marketing', 5);

-- Insert questions for Stage 6
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('Do you have organized tracking of income and expenses?', 'האם יש לך מעקב מסודר על הכנסות והוצאות?', 17, 'single_select', 1, 'FinancialTracking', 'finance', 6),
('Do you have automatic collection for customers?', 'האם יש לך גבייה אוטומטית ללקוחות?', 18, 'single_select', 1, 'PaymentCollection', 'finance', 6);

-- Insert questions for Stage 7
INSERT INTO questions (text, he_text, step, question_type, max_selections, option_set_name, category, stage_id)
VALUES
('What is the thing that most blocks you from moving forward?', 'מה הדבר שהכי חוסם אותך מלהתקדם?', 19, 'multi_select', 2, 'KeyChallenge', 'challenges', 7),
('What is most important for you that the application helps you achieve?', 'מה הכי חשוב לך שהאפליקציה תעזור לך להשיג?', 20, 'multi_select', 2, 'AppExpectation', 'challenges', 7);

-- Insert options for BusinessStage
INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'I am just starting out - I don''t have customers yet', 'אני רק בתחילת הדרך – עוד אין לי לקוחות', 'StartingOut', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'BusinessStage' AND os.name = 'BusinessStage';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'I have first customers but the business is not stable', 'אני עם לקוחות ראשונים אבל העסק לא יציב', 'FirstClientsUnstable', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'BusinessStage' AND os.name = 'BusinessStage';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'I have a steady turnover but want to grow', 'אני עם מחזור קבוע אבל רוצה לגדול', 'StableWantsGrowth', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'BusinessStage' AND os.name = 'BusinessStage';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'Stable business with high turnover - want to maximize profitability', 'עסק יציב עם מחזור גבוה – רוצה למקסם רווחיות', 'HighRevenueMaxProfit', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'BusinessStage' AND os.name = 'BusinessStage';

-- Insert options for LegalStatus
INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'Exempt Dealer', 'עוסק פטור', 'ExemptDealer', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'LegalStatus' AND os.name = 'LegalStatus';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'Licensed Dealer', 'עוסק מורשה', 'LicensedDealer', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'LegalStatus' AND os.name = 'LegalStatus';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'Ltd Company', 'חברה בע"מ', 'LtdCompany', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'LegalStatus' AND os.name = 'LegalStatus';

INSERT INTO options (question_id, display, he_value, option_key, option_set_id)
SELECT q.id, 'Don''t know yet', 'עדיין לא יודע', 'DontKnow', os.id
FROM questions q, option_sets os
WHERE q.option_set_name = 'LegalStatus' AND os.name = 'LegalStatus';

-- Continue with other option sets in a similar way...
-- This is a partial example. The full script would include all options for all option sets. 