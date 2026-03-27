#!/usr/bin/env python3
"""
Web Interface for Managing Google Maps Scraping
- Start/stop scraping jobs
- View progress
- Resume interrupted jobs
- View scraped data
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from datetime import datetime
import threading
from hybrid_scraper import HybridGoogleMapsScraper

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'ep-calm-resonance-a4od4ak8-pooler.us-east-1.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_k5gx8NvBJVAl',
    'port': 5432,
    'sslmode': 'require'
}

def get_db_connection():
    """Get database connection"""
    try:
        return psycopg2.connect(**db_config)
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# HTML Template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>SIKBO - Google Maps Scraping Manager</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .button:hover { background: #0056b3; }
        .button.danger { background: #dc3545; }
        .button.danger:hover { background: #c82333; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .progress { background: #e9ecef; border-radius: 5px; overflow: hidden; margin: 10px 0; }
        .progress-bar { background: #007bff; height: 20px; text-align: center; color: white; line-height: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
        .review-text { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rating { color: #ffc107; font-weight: bold; }
        .sentiment.positive { color: #28a745; }
        .sentiment.negative { color: #dc3545; }
        .sentiment.neutral { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SIKBO - Google Maps Scraping Manager</h1>
            <p>Real Google Maps Review Scraping with Progressive Saving</p>
        </div>

        <div class="section">
            <h2>📊 Current Status</h2>
            <div id="status-info">Loading...</div>
        </div>

        <div class="section">
            <h2>🎯 Start New Scraping Job</h2>
            <form id="scraping-form">
                <p>
                    <label>Restaurant Name:</label><br>
                    <input type="text" id="restaurant-name" value="The French Door" style="width: 300px; padding: 5px;">
                </p>
                <p>
                    <label>Target Reviews:</label><br>
                    <input type="number" id="target-reviews" value="25" min="1" max="100" style="width: 100px; padding: 5px;">
                </p>
                <button type="button" class="button" onclick="startScraping()">🚀 Start Scraping</button>
                <button type="button" class="button" onclick="resumeScraping()">🔄 Resume Last Job</button>
            </form>
            <div id="scraping-status"></div>
        </div>

        <div class="section">
            <h2>📋 Scraping Jobs</h2>
            <div id="jobs-list">Loading...</div>
        </div>

        <div class="section">
            <h2>📝 Recent Reviews</h2>
            <div id="reviews-list">Loading...</div>
        </div>

        <div class="section">
            <h2>🗑️ Database Management</h2>
            <button type="button" class="button danger" onclick="clearDatabase()">Clear All Data</button>
            <p><small>⚠️ This will remove all reviews and start fresh</small></p>
        </div>
    </div>

    <script>
        // Load initial data
        loadStatus();
        loadJobs();
        loadReviews();

        // Refresh data every 10 seconds
        setInterval(() => {
            loadStatus();
            loadJobs();
            loadReviews();
        }, 10000);

        async function loadStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                document.getElementById('status-info').innerHTML = `
                    <div class="status success">
                        <strong>Database Status:</strong> ${data.status}<br>
                        <strong>Total Reviews:</strong> ${data.total_reviews}<br>
                        <strong>Data Source:</strong> ${data.data_source}<br>
                        <strong>Last Updated:</strong> ${new Date(data.last_updated).toLocaleString()}
                    </div>
                `;
            } catch (error) {
                document.getElementById('status-info').innerHTML = `
                    <div class="status error">Error loading status: ${error.message}</div>
                `;
            }
        }

        async function loadJobs() {
            try {
                const response = await fetch('/api/jobs');
                const data = await response.json();
                
                let html = '<table><tr><th>ID</th><th>Restaurant</th><th>Status</th><th>Reviews</th><th>Created</th><th>Actions</th></tr>';
                
                data.jobs.forEach(job => {
                    const progress = job.target_reviews > 0 ? (job.reviews_scraped / job.target_reviews * 100) : 0;
                    html += `
                        <tr>
                            <td>${job.id}</td>
                            <td>${job.restaurant_name}</td>
                            <td><span class="status ${job.status}">${job.status}</span></td>
                            <td>
                                ${job.reviews_scraped}
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${progress}%">${Math.round(progress)}%</div>
                                </div>
                            </td>
                            <td>${new Date(job.created_at).toLocaleString()}</td>
                            <td>
                                ${job.status === 'in_progress' ? 
                                    '<button class="button" onclick="stopJob(' + job.id + ')">Stop</button>' :
                                    '<button class="button" onclick="resumeJob(' + job.id + ')">Resume</button>'
                                }
                            </td>
                        </tr>
                    `;
                });
                
                html += '</table>';
                document.getElementById('jobs-list').innerHTML = html;
            } catch (error) {
                document.getElementById('jobs-list').innerHTML = `
                    <div class="status error">Error loading jobs: ${error.message}</div>
                `;
            }
        }

        async function loadReviews() {
            try {
                const response = await fetch('/api/reviews?limit=10');
                const data = await response.json();
                
                let html = '<table><tr><th>Reviewer</th><th>Rating</th><th>Sentiment</th><th>Review Text</th><th>Date</th></tr>';
                
                data.reviews.forEach(review => {
                    html += `
                        <tr>
                            <td>${review.reviewer_name}</td>
                            <td><span class="rating">${'⭐'.repeat(review.rating)}</span></td>
                            <td><span class="sentiment ${review.sentiment}">${review.sentiment}</span></td>
                            <td class="review-text" title="${review.review_text}">${review.review_text}</td>
                            <td>${new Date(review.scraped_at).toLocaleDateString()}</td>
                        </tr>
                    `;
                });
                
                html += '</table>';
                document.getElementById('reviews-list').innerHTML = html;
            } catch (error) {
                document.getElementById('reviews-list').innerHTML = `
                    <div class="status error">Error loading reviews: ${error.message}</div>
                `;
            }
        }

        async function startScraping() {
            const restaurantName = document.getElementById('restaurant-name').value;
            const targetReviews = document.getElementById('target-reviews').value;
            
            document.getElementById('scraping-status').innerHTML = `
                <div class="status warning">Starting scraping job for ${restaurantName}...</div>
            `;
            
            try {
                const response = await fetch('/api/start-scraping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        restaurant_name: restaurantName,
                        target_reviews: parseInt(targetReviews)
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('scraping-status').innerHTML = `
                        <div class="status success">Scraping job started! Job ID: ${data.job_id}</div>
                    `;
                } else {
                    document.getElementById('scraping-status').innerHTML = `
                        <div class="status error">Error: ${data.error}</div>
                    `;
                }
            } catch (error) {
                document.getElementById('scraping-status').innerHTML = `
                    <div class="status error">Error starting scraping: ${error.message}</div>
                `;
            }
        }

        async function clearDatabase() {
            if (confirm('Are you sure you want to clear all review data? This cannot be undone.')) {
                try {
                    const response = await fetch('/api/clear-database', { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Database cleared successfully!');
                        loadStatus();
                        loadJobs();
                        loadReviews();
                    } else {
                        alert('Error clearing database: ' + data.error);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Main web interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/status')
def get_status():
    """Get current database status"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get total reviews
        cursor.execute("SELECT COUNT(*) as total FROM reviews")
        total_reviews = cursor.fetchone()['total']
        
        # Get latest scraping job
        cursor.execute("""
            SELECT status, last_scraped_at 
            FROM scraping_jobs 
            ORDER BY updated_at DESC 
            LIMIT 1
        """)
        latest_job = cursor.fetchone()
        
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'total_reviews': total_reviews,
            'data_source': 'Neon Database (REAL Reviews)',
            'last_updated': datetime.now().isoformat(),
            'latest_job_status': latest_job['status'] if latest_job else 'none'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs')
def get_jobs():
    """Get all scraping jobs"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, restaurant_name, status, reviews_scraped, 
                   created_at, updated_at, last_scraped_at
            FROM scraping_jobs 
            ORDER BY created_at DESC
            LIMIT 20
        """)
        
        jobs = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        jobs_list = []
        for job in jobs:
            jobs_list.append({
                'id': job['id'],
                'restaurant_name': job['restaurant_name'],
                'status': job['status'],
                'reviews_scraped': job['reviews_scraped'],
                'target_reviews': 50,  # Default target
                'created_at': job['created_at'].isoformat() if job['created_at'] else None,
                'updated_at': job['updated_at'].isoformat() if job['updated_at'] else None,
                'last_scraped_at': job['last_scraped_at'].isoformat() if job['last_scraped_at'] else None
            })
        
        return jsonify({'jobs': jobs_list})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reviews')
def get_reviews():
    """Get recent reviews"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT r.reviewer_name, r.rating, r.review_text, r.scraped_at,
                   sa.overall_sentiment
            FROM reviews r
            LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
            ORDER BY r.scraped_at DESC
            LIMIT %s
        """, (limit,))
        
        reviews = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        reviews_list = []
        for review in reviews:
            reviews_list.append({
                'reviewer_name': review['reviewer_name'],
                'rating': review['rating'],
                'review_text': review['review_text'],
                'sentiment': review['overall_sentiment'] or 'neutral',
                'scraped_at': review['scraped_at'].isoformat() if review['scraped_at'] else None
            })
        
        return jsonify({'reviews': reviews_list})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/start-scraping', methods=['POST'])
def start_scraping():
    """Start a new scraping job"""
    try:
        data = request.get_json()
        restaurant_name = data.get('restaurant_name', 'The French Door')
        target_reviews = data.get('target_reviews', 25)
        
        # Start scraping in background thread
        def run_scraping():
            scraper = HybridGoogleMapsScraper()
            scraper.run_hybrid_scraping(restaurant_name, target_reviews)
        
        thread = threading.Thread(target=run_scraping)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Scraping started for {restaurant_name}',
            'job_id': 'background_job'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume-scraping', methods=['POST'])
def resume_scraping():
    """Resume the last scraping job"""
    try:
        # Find the last incomplete job
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, restaurant_name, reviews_scraped
            FROM scraping_jobs 
            WHERE status IN ('pending', 'in_progress')
            ORDER BY updated_at DESC
            LIMIT 1
        """)
        
        job = cursor.fetchone()
        conn.close()
        
        if not job:
            return jsonify({'success': False, 'error': 'No incomplete jobs found'}), 404
        
        # Resume scraping in background
        def run_resume_scraping():
            scraper = HybridGoogleMapsScraper()
            scraper.current_job_id = job['id']
            scraper.scraped_count = job['reviews_scraped']
            scraper.run_hybrid_scraping(job['restaurant_name'], 50)
        
        thread = threading.Thread(target=run_resume_scraping)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Resumed scraping for {job["restaurant_name"]}',
            'job_id': job['id']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stop-job', methods=['POST'])
def stop_job():
    """Stop a scraping job"""
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        
        if not job_id:
            return jsonify({'success': False, 'error': 'Job ID required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE scraping_jobs 
            SET status = 'stopped', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (job_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Job stopped successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume-job', methods=['POST'])
def resume_job():
    """Resume a specific scraping job"""
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        
        if not job_id:
            return jsonify({'success': False, 'error': 'Job ID required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT restaurant_name, reviews_scraped
            FROM scraping_jobs 
            WHERE id = %s
        """, (job_id,))
        
        job = cursor.fetchone()
        
        if not job:
            conn.close()
            return jsonify({'success': False, 'error': 'Job not found'}), 404
        
        # Update job status
        cursor.execute("""
            UPDATE scraping_jobs 
            SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (job_id,))
        
        conn.commit()
        conn.close()
        
        # Resume scraping in background
        def run_resume_job():
            scraper = HybridGoogleMapsScraper()
            scraper.current_job_id = job_id
            scraper.scraped_count = job['reviews_scraped']
            scraper.run_hybrid_scraping(job['restaurant_name'], 50)
        
        thread = threading.Thread(target=run_resume_job)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Resumed job for {job["restaurant_name"]}',
            'job_id': job_id
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/clear-database', methods=['POST'])
def clear_database():
    """Clear all review data"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Clear all tables
        cursor.execute("DELETE FROM sentiment_analysis")
        cursor.execute("DELETE FROM reviews")
        cursor.execute("DELETE FROM scraping_jobs")
        
        # Reset sequences
        cursor.execute("ALTER SEQUENCE reviews_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE sentiment_analysis_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE scraping_jobs_id_seq RESTART WITH 1")
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Database cleared successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🌐 SIKBO Scraping Web Interface")
    print("📊 Manage Google Maps scraping jobs")
    print("🔄 Progressive scraping with resume capability")
    print("💾 Real-time database monitoring")
    print("🌐 Access at: http://localhost:8003")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8003, debug=True)