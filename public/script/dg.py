#!/usr/bin/env python3
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import os

# Create output directory if it doesn't exist
os.makedirs('thesis_diagrams', exist_ok=True)

# Set consistent style for all plots
plt.style.use('seaborn-v0_8-whitegrid')
MAIN_COLOR = '#1a73e8'
ACCENT_COLOR = '#c91818'
COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6']

def set_common_style(ax):
    """Apply common styling to matplotlib axes"""
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_linewidth(0.5)
    ax.spines['left'].set_linewidth(0.5)
    ax.grid(color='#E0E0E0', linestyle='-', linewidth=0.5, alpha=0.7)
    ax.tick_params(axis='both', which='both', labelsize=9)

# Figure 4.7: Query Understanding Performance across medical categories
def create_query_understanding_chart():
    # Sample data based on MediMap healthcare categories
    categories = ['General Medicine', 'Cardiology', 'Orthopedics', 'Radiology', 'Laboratory', 'Pediatrics']
    precision = [0.92, 0.89, 0.87, 0.94, 0.96, 0.90]
    recall = [0.88, 0.85, 0.83, 0.91, 0.93, 0.86]
    f1_score = [0.90, 0.87, 0.85, 0.92, 0.94, 0.88]
    
    # Create DataFrame
    df = pd.DataFrame({
        'Category': categories,
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1_score
    })
    
    # Set up the figure
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Set width of bars
    bar_width = 0.25
    
    # Set positions of bars on X axis
    r1 = np.arange(len(categories))
    r2 = [x + bar_width for x in r1]
    r3 = [x + bar_width for x in r2]
    
    # Create bars
    ax.bar(r1, df['Precision'], width=bar_width, color=COLORS[0], label='Precision')
    ax.bar(r2, df['Recall'], width=bar_width, color=COLORS[1], label='Recall')
    ax.bar(r3, df['F1 Score'], width=bar_width, color=COLORS[2], label='F1 Score')
    
    # Add labels and title
    ax.set_title('Query Understanding Performance Across Medical Categories', fontsize=14, fontweight='bold')
    ax.set_xlabel('Medical Category', fontsize=12)
    ax.set_ylabel('Performance Score', fontsize=12)
    ax.set_xticks([r + bar_width for r in range(len(categories))])
    ax.set_xticklabels(categories, rotation=45, ha='right')
    ax.set_ylim(0, 1.0)
    
    # Add a horizontal grid
    ax.yaxis.grid(True, linestyle='--', alpha=0.7)
    
    # Add value labels on top of bars
    for i, bars in enumerate([r1, r2, r3]):
        for j, bar in enumerate(bars):
            value = [precision, recall, f1_score][i][j]
            ax.text(bar + bar_width/2, value + 0.01, f"{value:.2f}", 
                   ha='center', va='bottom', fontsize=9)
    
    # Add legend
    ax.legend(loc='upper right')
    
    # Apply common styling
    set_common_style(ax)
    
    # Save the figure
    plt.tight_layout()
    plt.savefig('thesis_diagrams/fig_4_7_query_understanding.png', dpi=300, bbox_inches='tight')
    print("Figure 4.7 created: thesis_diagrams/fig_4_7_query_understanding.png")

# Figure 4.10: User Feedback Themes - Horizontal bar chart
def create_user_feedback_chart():
    # Sample data based on MediMap user feedback
    feedback_themes = [
        'Improved Lab Search', 
        'Map Usability', 
        'Report Management', 
        'Response Time', 
        'Mobile Experience', 
        'Navigation Features', 
        'Medical Assistant Helpfulness'
    ]
    
    frequency = [78, 65, 62, 53, 49, 42, 39]
    
    # Sort data by frequency
    sorted_indices = np.argsort(frequency)
    sorted_themes = [feedback_themes[i] for i in sorted_indices]
    sorted_freq = [frequency[i] for i in sorted_indices]
    
    # Create figure
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Create horizontal bars
    bars = ax.barh(sorted_themes, sorted_freq, color=COLORS)
    
    # Customize colors - gradient effect
    for i, bar in enumerate(bars):
        bar.set_color(COLORS[i % len(COLORS)])
    
    # Add title and labels
    ax.set_title('Frequency of Common Themes in User Feedback', fontsize=14, fontweight='bold')
    ax.set_xlabel('Frequency', fontsize=12)
    
    # Add value labels
    for i, v in enumerate(sorted_freq):
        ax.text(v + 1, i, str(v), va='center', fontsize=10)
    
    # Apply common styling
    set_common_style(ax)
    
    # Save the figure
    plt.tight_layout()
    plt.savefig('thesis_diagrams/fig_4_10_feedback_themes.png', dpi=300, bbox_inches='tight')
    print("Figure 4.10 created: thesis_diagrams/fig_4_10_feedback_themes.png")

# Figure 4.11: Comparative Platform Analysis - Radar chart
def create_comparative_radar_chart():
    # Categories for comparison
    categories = [
        'Geospatial Functionality',
        'User Interface',
        'Data Management',
        'Search Capabilities',
        'Mobile Responsiveness'
    ]
    
    # Data for MediMap and competitors
    medimap_scores = [4.8, 4.2, 4.5, 4.6, 4.3]
    competitor1_scores = [3.5, 4.0, 4.2, 4.0, 4.5]
    competitor2_scores = [4.0, 3.8, 3.5, 4.2, 3.7]
    
    # Number of categories
    N = len(categories)
    
    # What will be the angle of each axis in the plot (divide the plot / number of variables)
    angles = [n / N * 2 * np.pi for n in range(N)]
    angles += angles[:1]  # Close the loop
    
    # Scores need to be concatenated to close the loop as well
    medimap_scores += medimap_scores[:1]
    competitor1_scores += competitor1_scores[:1]
    competitor2_scores += competitor2_scores[:1]
    
    # Set up the figure
    fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(polar=True))
    
    # Draw one axis per variable and add labels
    plt.xticks(angles[:-1], categories, size=10)
    
    # Draw the plots
    ax.plot(angles, medimap_scores, linewidth=2, linestyle='solid', label='MediMap', color=COLORS[0])
    ax.fill(angles, medimap_scores, color=COLORS[0], alpha=0.25)
    
    ax.plot(angles, competitor1_scores, linewidth=2, linestyle='solid', label='Competitor 1', color=COLORS[1])
    ax.fill(angles, competitor1_scores, color=COLORS[1], alpha=0.25)
    
    ax.plot(angles, competitor2_scores, linewidth=2, linestyle='solid', label='Competitor 2', color=COLORS[2])
    ax.fill(angles, competitor2_scores, color=COLORS[2], alpha=0.25)
    
    # Set the limits and ticks
    ax.set_ylim(0, 5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_yticklabels(['1', '2', '3', '4', '5'])
    
    # Add a title
    plt.title('Comparative Platform Analysis', size=14, fontweight='bold')
    
    # Add a legend
    plt.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
    
    # Save the figure
    plt.tight_layout()
    plt.savefig('thesis_diagrams/fig_4_11_comparative_radar.png', dpi=300, bbox_inches='tight')
    print("Figure 4.11 created: thesis_diagrams/fig_4_11_comparative_radar.png")

# Figure 4.12: Performance Across Connectivity Scenarios - Line graph
def create_connectivity_performance_chart():
    # Connectivity scenarios
    scenarios = ['Urban 4G', 'Urban 3G', 'Rural 4G', 'Rural 3G', 'Low Bandwidth', 'No Connectivity']
    
    # Performance metrics
    load_time = [1.2, 2.1, 1.8, 3.2, 4.5, 0.9]  # In seconds (offline mode is fast once loaded)
    map_rendering = [100, 95, 90, 80, 60, 30]  # Performance percentage
    search_speed = [100, 90, 85, 70, 50, 40]  # Performance percentage
    feature_availability = [100, 100, 100, 95, 80, 40]  # Percentage of features available
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Plot lines
    ax.plot(scenarios, load_time, marker='o', linewidth=2, label='Load Time (s)', color=COLORS[0])
    ax.plot(scenarios, map_rendering, marker='s', linewidth=2, label='Map Rendering (%)', color=COLORS[1])
    ax.plot(scenarios, search_speed, marker='^', linewidth=2, label='Search Speed (%)', color=COLORS[2])
    ax.plot(scenarios, feature_availability, marker='d', linewidth=2, label='Feature Availability (%)', color=COLORS[3])
    
    # Add shaded area for performance degradation visualization
    x = range(len(scenarios))
    # Create a gradient effect for the background
    for i in range(len(x)-1):
        ax.axvspan(i, i+1, alpha=0.1, color='gray', ymin=0, ymax=1)
    
    # Set up labels and title
    ax.set_title('Performance Across Connectivity Scenarios', fontsize=14, fontweight='bold')
    ax.set_xlabel('Connectivity Scenario', fontsize=12)
    ax.set_ylabel('Performance Metric', fontsize=12)
    
    # Add grid
    ax.grid(True, linestyle='--', alpha=0.7)
    
    # Add legend
    ax.legend(loc='center right')
    
    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45)
    
    # Apply common styling
    set_common_style(ax)
    
    # Create a secondary y-axis for load time
    ax2 = ax.twinx()
    ax2.set_ylabel('Load Time (seconds)', fontsize=12, color=COLORS[0])
    ax2.tick_params(axis='y', colors=COLORS[0])
    ax2.set_ylim(0, 5)
    
    # Set primary y-axis range
    ax.set_ylim(0, 110)
    
    # Save the figure
    plt.tight_layout()
    plt.savefig('thesis_diagrams/fig_4_12_connectivity_performance.png', dpi=300, bbox_inches='tight')
    print("Figure 4.12 created: thesis_diagrams/fig_4_12_connectivity_performance.png")

# Run all chart-generating functions
if __name__ == "__main__":
    print("Generating charts for MediMap thesis...")
    create_query_understanding_chart()
    create_user_feedback_chart()
    create_comparative_radar_chart()
    create_connectivity_performance_chart()
    print("All charts generated successfully!")
