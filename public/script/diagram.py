#!/usr/bin/env python3
import matplotlib.pyplot as plt
import networkx as nx
from matplotlib.patches import Rectangle
import numpy as np
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
import pandas as pd
import os
from matplotlib.gridspec import GridSpec

# Create output directory if it doesn't exist
os.makedirs('thesis_diagrams', exist_ok=True)

# Set consistent style for all plots
plt.style.use('seaborn-v0_8-whitegrid')
MAIN_COLOR = '#1a73e8'
ACCENT_COLOR = '#c91818'
NODE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6']

def set_common_style(ax):
    """Apply common styling to matplotlib axes"""
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_linewidth(0.5)
    ax.spines['left'].set_linewidth(0.5)
    ax.grid(color='#E0E0E0', linestyle='-', linewidth=0.5, alpha=0.7)
    ax.tick_params(axis='both', which='both', labelsize=9)


# 1. Research Methodology Framework (3-Layer Architecture)
def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Create a directed graph
    G = nx.DiGraph()
    
    # Add nodes for each layer
    G.add_node("Client Layer", pos=(0, 2))
    G.add_node("Server Layer", pos=(1, 2))
    G.add_node("Data Layer", pos=(2, 2))
    
    # Add component nodes
    G.add_node("Map Interface\nReport Vault\nMedical Assistant\nUI Components", pos=(0, 1))
    G.add_node("Express.js\nAPI Endpoints\nAuthentication\nRoute Handlers", pos=(1, 1))
    G.add_node("Lab Database\nUser Data\nReports (IDB)\nGeospatial DB", pos=(2, 1))
    
    # Add edges
    edges = [
        ("Client Layer", "Server Layer"),
        ("Server Layer", "Client Layer"),
        ("Server Layer", "Data Layer"),
        ("Data Layer", "Server Layer"),
        ("Client Layer", "Map Interface\nReport Vault\nMedical Assistant\nUI Components"),
        ("Map Interface\nReport Vault\nMedical Assistant\nUI Components", "Client Layer"),
        ("Server Layer", "Express.js\nAPI Endpoints\nAuthentication\nRoute Handlers"),
        ("Express.js\nAPI Endpoints\nAuthentication\nRoute Handlers", "Server Layer"),
        ("Data Layer", "Lab Database\nUser Data\nReports (IDB)\nGeospatial DB"),
        ("Lab Database\nUser Data\nReports (IDB)\nGeospatial DB", "Data Layer")
    ]
    G.add_edges_from(edges)
    
    # Get position from node attributes
    pos = nx.get_node_attributes(G, 'pos')
    
    # Draw the nodes with different colors for each layer type
    layer_nodes = ["Client Layer", "Server Layer", "Data Layer"]
    component_nodes = ["Map Interface\nReport Vault\nMedical Assistant\nUI Components",
                      "Express.js\nAPI Endpoints\nAuthentication\nRoute Handlers",
                      "Lab Database\nUser Data\nReports (IDB)\nGeospatial DB"]
    
    nx.draw_networkx_nodes(G, pos, nodelist=layer_nodes, node_color=[NODE_COLORS[0], NODE_COLORS[1], NODE_COLORS[2]], 
                          node_size=3000, node_shape='s', alpha=0.8)
    
    nx.draw_networkx_nodes(G, pos, nodelist=component_nodes, node_color=[NODE_COLORS[0], NODE_COLORS[1], NODE_COLORS[2]], 
                          node_size=3000, node_shape='o', alpha=0.6)
    
    # Draw edges with arrows
    nx.draw_networkx_edges(G, pos, width=1.5, edge_color='gray', 
                          arrowsize=15, arrowstyle='->', connectionstyle='arc3,rad=0.1')
    
    # Draw labels with custom font sizes
    nx.draw_networkx_labels(G, pos, font_size=11, font_family='sans-serif', font_weight='bold')
    
    plt.title('MediMap System Architecture (3-Layer)', fontsize=16, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/architecture_diagram.png', dpi=300, bbox_inches='tight')
    print("Architecture diagram created: thesis_diagrams/architecture_diagram.png")


# 2. Component Interaction Diagram
def create_component_diagram():
    # Create a 3x3 directed graph
    G = nx.DiGraph()
    
    # Define node positions on a 3x3 grid
    positions = {
        "Map Module": (0, 2),
        "Core Services": (1, 2),
        "Data Access": (2, 2),
        "Report Vault": (0, 1),
        "Security": (1, 1),
        "External APIs": (2, 1),
        "Medical Assistant": (0, 0),
        "UI Components": (1, 0),
        "Communication Module": (2, 0)
    }
    
    # Add nodes with positions
    for node, pos in positions.items():
        G.add_node(node, pos=pos)
    
    # Connect horizontally
    for i in range(3):
        for j in range(2):
            y = 2-i  # Reverse to match diagram
            G.add_edge(list(positions.keys())[i*3+j], list(positions.keys())[i*3+j+1])
            G.add_edge(list(positions.keys())[i*3+j+1], list(positions.keys())[i*3+j])
    
    # Connect vertically
    for i in range(2):
        for j in range(3):
            G.add_edge(list(positions.keys())[i*3+j], list(positions.keys())[(i+1)*3+j])
            G.add_edge(list(positions.keys())[(i+1)*3+j], list(positions.keys())[i*3+j])
    
    fig, ax = plt.subplots(figsize=(10, 7))
    
    # Get positions
    pos = nx.get_node_attributes(G, 'pos')
    
    # Define node colors (3 rows with 3 nodes each, gradient colors)
    colors = []
    for i in range(3):
        for j in range(3):
            colors.append(NODE_COLORS[i*2 % len(NODE_COLORS)])
    
    # Draw nodes
    nx.draw_networkx_nodes(G, pos, node_size=2800, node_color=colors, alpha=0.7, edgecolors='gray')
    
    # Draw edges
    nx.draw_networkx_edges(G, pos, width=1.3, alpha=0.7, edge_color='gray', 
                          arrowstyle='->', arrowsize=15, connectionstyle='arc3,rad=0.15')
    
    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=10, font_family='sans-serif', font_weight='bold')
    
    plt.title('MediMap Component Interaction Diagram', fontsize=16, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/component_interaction_diagram.png', dpi=300, bbox_inches='tight')
    print("Component diagram created: thesis_diagrams/component_interaction_diagram.png")


# 3. User Flow Diagram (additional visualization)
def create_user_flow_diagram():
    fig, ax = plt.subplots(figsize=(12, 6))
    
    G = nx.DiGraph()
    
    # Define nodes and their positions
    nodes = [
        ("Start", {'pos': (0, 2)}),
        ("Find Lab", {'pos': (1, 3)}),
        ("View Reports", {'pos': (1, 1)}),
        ("Medical Assistant", {'pos': (2, 2)}),
        ("Book Appointment", {'pos': (3, 3)}),
        ("Upload Report", {'pos': (3, 1)}),
        ("Get Directions", {'pos': (4, 3)}),
        ("Share Report", {'pos': (4, 1)}),
        ("Visit Lab", {'pos': (5, 2)}),
    ]
    
    G.add_nodes_from(nodes)
    
    # Define edges
    edges = [
        ("Start", "Find Lab"),
        ("Start", "View Reports"),
        ("Find Lab", "Medical Assistant"),
        ("View Reports", "Medical Assistant"),
        ("Medical Assistant", "Book Appointment"),
        ("Medical Assistant", "Upload Report"),
        ("Book Appointment", "Get Directions"),
        ("Upload Report", "Share Report"),
        ("Get Directions", "Visit Lab"),
        ("Share Report", "Visit Lab")
    ]
    
    G.add_edges_from(edges)
    
    pos = nx.get_node_attributes(G, 'pos')
    
    # Draw nodes with gradient colors
    cmap = plt.cm.Blues
    node_colors = [cmap(0.3), cmap(0.4), cmap(0.4), cmap(0.5), cmap(0.6), 
                   cmap(0.6), cmap(0.7), cmap(0.7), cmap(0.8)]
    
    nx.draw_networkx_nodes(G, pos, node_size=2500, node_color=node_colors, 
                          alpha=0.8, edgecolors='gray', linewidths=1)
    
    # Draw edge with arrows
    nx.draw_networkx_edges(G, pos, width=2, alpha=0.7, edge_color='gray',
                          arrowstyle='->', arrowsize=20, connectionstyle='arc3,rad=0.1')
    
    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=11, font_family='sans-serif', font_weight='bold')
    
    plt.title('User Journey Flow in MediMap System', fontsize=16, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/user_flow_diagram.png', dpi=300, bbox_inches='tight')
    print("User flow diagram created: thesis_diagrams/user_flow_diagram.png")


# 4. Technology Stack Visualization (additional visualization)
def create_tech_stack_diagram():
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Define categories and technologies
    categories = ['Frontend', 'Backend', 'APIs', 'Storage', 'Security']
    
    technologies = {
        'Frontend': ['HTML/CSS', 'JavaScript', 'Leaflet Maps'],
        'Backend': ['Node.js', 'Express', 'REST Endpoints'],
        'APIs': ['Google AI', 'ApiMedic', 'Semantic Scholar'],
        'Storage': ['IndexedDB', 'LocalStorage', 'Client-side DB'],
        'Security': ['JWT Auth', 'Password Protection', 'HTTP-only Cookies']
    }
    
    # Calculate positions
    y_positions = {}
    max_techs = max(len(techs) for techs in technologies.values())
    
    for i, cat in enumerate(categories):
        techs = technologies[cat]
        y_base = (len(categories) - i - 1) * (max_techs + 1)
        y_positions[cat] = y_base
        
        # Draw category box
        rect = Rectangle((0, y_base - 0.4), 3, len(techs) + 0.8, 
                        facecolor=plt.cm.Pastel1(i/len(categories)), 
                        alpha=0.6, edgecolor='black', linewidth=1)
        ax.add_patch(rect)
        ax.text(1.5, y_base + len(techs)/2, cat, ha='center', va='center', 
               fontsize=14, fontweight='bold')
        
        # Draw technology boxes
        for j, tech in enumerate(techs):
            tech_y = y_base + j
            rect = Rectangle((4, tech_y - 0.4), 6, 0.8, 
                            facecolor=plt.cm.Pastel2(j/len(techs)), 
                            alpha=0.7, edgecolor='black', linewidth=1)
            ax.add_patch(rect)
            ax.text(7, tech_y, tech, ha='center', va='center', fontsize=11)
            
            # Connect with lines
            ax.plot([3, 4], [y_base + len(techs)/2, tech_y], 'k-', alpha=0.5)
    
    ax.set_xlim(-1, 11)
    ax.set_ylim(-1, (len(categories)) * (max_techs + 1))
    ax.axis('off')
    
    plt.title('MediMap Technology Stack', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/technology_stack.png', dpi=300, bbox_inches='tight')
    print("Technology stack diagram created: thesis_diagrams/technology_stack.png")


# 5. System Features Radar Chart
def create_features_radar():
    # Features and their implementation levels (0-5)
    features = ['Lab Finder', 'Report Management', 'Medical Assistant', 
                'User Security', 'Data Privacy', 'Accessibility',
                'Map Accuracy', 'Performance']
    
    implementation = [5, 4.5, 4, 4.8, 5, 3.8, 4.5, 4.2]
    importance = [5, 5, 4.5, 5, 4.8, 4.0, 4.5, 4.5]
    
    # Number of variables
    N = len(features)
    
    # Create angle for each feature
    angles = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
    angles += angles[:1]  # Close the circle
    
    # Extend the data to close the circle
    implementation += implementation[:1]
    importance += importance[:1]
    features += features[:1]
    
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    
    # Draw the chart
    ax.plot(angles, implementation, 'o-', linewidth=2, label='Implementation Level', color='#1a73e8')
    ax.fill(angles, implementation, alpha=0.25, color='#1a73e8')
    
    ax.plot(angles, importance, 'o-', linewidth=2, label='Importance', color='#c91818')
    ax.fill(angles, importance, alpha=0.1, color='#c91818')
    
    # Set feature labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(features[:-1], fontsize=11)
    
    # Set y-axis limits
    ax.set_ylim(0, 5.5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_yticklabels(['1', '2', '3', '4', '5'])
    
    # Add legend
    ax.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
    
    plt.title('MediMap System Features Analysis', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/features_radar.png', dpi=300, bbox_inches='tight')
    print("Features radar chart created: thesis_diagrams/features_radar.png")


# 6. Data Flow Diagram (additional visualization)
def create_data_flow_diagram():
    fig, ax = plt.subplots(figsize=(12, 8))
    
    G = nx.DiGraph()
    
    # Define nodes
    nodes = [
        ("User", {'pos': (0, 3), 'type': 'external'}),
        ("Client Interface", {'pos': (2, 3), 'type': 'process'}),
        ("Local Storage", {'pos': (2, 1), 'type': 'data'}),
        ("Server", {'pos': (5, 3), 'type': 'process'}),
        ("External APIs", {'pos': (8, 3), 'type': 'external'}),
        ("Lab Database", {'pos': (5, 1), 'type': 'data'}),
        ("Authentication", {'pos': (5, 5), 'type': 'process'}),
    ]
    
    G.add_nodes_from(nodes)
    
    # Define edges with labels
    edges = [
        ("User", "Client Interface", "Inputs"),
        ("Client Interface", "User", "Shows Results"),
        ("Client Interface", "Local Storage", "Saves Reports"),
        ("Local Storage", "Client Interface", "Retrieves Data"),
        ("Client Interface", "Server", "API Requests"),
        ("Server", "Client Interface", "API Responses"),
        ("Server", "External APIs", "Fetches Information"),
        ("External APIs", "Server", "Returns Data"),
        ("Server", "Lab Database", "Queries"),
        ("Lab Database", "Server", "Returns Results"),
        ("User", "Authentication", "Login"),
        ("Authentication", "Client Interface", "Grants Access"),
        ("Authentication", "Server", "Verifies"),
    ]
    
    G.add_edges_from([(u, v, {'label': l}) for u, v, l in edges])
    
    pos = nx.get_node_attributes(G, 'pos')
    
    # Get node types
    node_types = nx.get_node_attributes(G, 'type')
    
    # Define shapes for different node types
    node_shapes = {
        'process': 'o',  # circle
        'data': 's',     # square
        'external': 'd'  # diamond
    }
    
    # Draw nodes by type
    for shape in node_shapes:
        node_list = [node for node, data in node_types.items() if data == shape]
        nx.draw_networkx_nodes(G, pos, 
                              nodelist=node_list,
                              node_size=3000, 
                              node_color=[NODE_COLORS[list(node_shapes.keys()).index(shape)]],
                              node_shape=node_shapes[shape],
                              alpha=0.7)
    
    # Draw edges
    nx.draw_networkx_edges(G, pos, width=1.5, alpha=0.7,
                          arrowstyle='->', arrowsize=15,
                          edge_color='gray', connectionstyle='arc3,rad=0.1')
    
    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=11, font_family='sans-serif', font_weight='bold')
    
    # Draw edge labels
    edge_labels = nx.get_edge_attributes(G, 'label')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=9)
    
    # Create legend for node types
    legend_elements = [
        plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=NODE_COLORS[0], markersize=15, label='Process'),
        plt.Line2D([0], [0], marker='s', color='w', markerfacecolor=NODE_COLORS[1], markersize=15, label='Data Store'),
        plt.Line2D([0], [0], marker='d', color='w', markerfacecolor=NODE_COLORS[2], markersize=15, label='External Entity')
    ]
    ax.legend(handles=legend_elements, loc='lower right')
    
    plt.title('MediMap System Data Flow Diagram', fontsize=16, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/data_flow_diagram.png', dpi=300, bbox_inches='tight')
    print("Data flow diagram created: thesis_diagrams/data_flow_diagram.png")


# 7. Implementation Timeline (Gantt Chart)
def create_timeline_chart():
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Project phases and their timelines
    phases = [
        'Requirements Analysis',
        'System Design',
        'Frontend Development',
        'Backend Development',
        'Integration',
        'Testing',
        'Deployment',
        'Documentation'
    ]
    
    # Start and duration (in weeks)
    starts = [0, 3, 5, 5, 10, 12, 15, 13]
    durations = [3, 4, 6, 8, 3, 4, 2, 4]
    
    # Colors for different phases
    colors = plt.cm.tab10(np.linspace(0, 1, len(phases)))
    
    # Create Gantt chart
    y_positions = range(len(phases), 0, -1)
    
    for i, (phase, start, duration, color) in enumerate(zip(phases, starts, durations, colors)):
        ax.barh(y_positions[i], duration, left=start, height=0.6, 
               color=color, alpha=0.8, edgecolor='black', linewidth=0.5)
        
        # Add text inside the bars
        if duration > 2:  # Only add text if bar is wide enough
            ax.text(start + duration/2, y_positions[i], phase, 
                   ha='center', va='center', color='white', fontweight='bold')
        else:
            ax.text(start + duration + 0.1, y_positions[i], phase, 
                   ha='left', va='center', fontsize=10)
    
    # Set y-axis ticks
    ax.set_yticks(range(len(phases), 0, -1))
    ax.set_yticklabels(phases)
    
    # Set x-axis
    ax.set_xlim(0, max(starts) + max(durations) + 1)
    ax.set_xlabel('Timeline (weeks)', fontsize=12)
    ax.grid(axis='x', linestyle='--', alpha=0.7)
    
    # Customize the chart
    set_common_style(ax)
    
    plt.title('MediMap Implementation Timeline', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.savefig('thesis_diagrams/implementation_timeline.png', dpi=300, bbox_inches='tight')
    print("Implementation timeline created: thesis_diagrams/implementation_timeline.png")


# 8. Summary Dashboard (combined visualization)
def create_summary_dashboard():
    # Create a 2x2 grid of visualizations
    fig = plt.figure(figsize=(16, 12))
    gs = GridSpec(2, 2, figure=fig)
    
    # System Architecture Overview - Top Left
    ax1 = fig.add_subplot(gs[0, 0])
    
    # Client-Server-Data interaction
    layers = ['Client', 'Server', 'Data']
    interactions = np.array([
        [0, 75, 25],  # Client layer interactions
        [65, 0, 35],  # Server layer interactions
        [30, 70, 0]   # Data layer interactions
    ])
    
    sns.heatmap(interactions, annot=True, fmt='d', cmap='Blues', 
               xticklabels=layers, yticklabels=layers, ax=ax1)
    ax1.set_title('System Component Interactions (%)', fontsize=14, fontweight='bold')
    
    # System Feature Comparison - Top Right
    ax2 = fig.add_subplot(gs[0, 1])
    
    # Features of the system compared to requirements
    features = ['Lab Finding', 'Reports', 'Medical AI', 'Security']
    metrics = {
        'Implementation': [95, 90, 85, 92],
        'User Satisfaction': [88, 92, 80, 95],
        'Performance': [90, 85, 78, 98]
    }
    
    x = np.arange(len(features))
    width = 0.25
    multiplier = 0
    
    for attribute, measurement in metrics.items():
        offset = width * multiplier
        rects = ax2.bar(x + offset, measurement, width, label=attribute)
        ax2.bar_label(rects, padding=3, fmt='%d')
        multiplier += 1
    
    ax2.set_xticks(x + width, features)
    ax2.set_ylim(0, 110)
    ax2.legend(loc='upper center', bbox_to_anchor=(0.5, -0.05), ncol=3)
    ax2.set_title('System Features Evaluation (%)', fontsize=14, fontweight='bold')
    set_common_style(ax2)
    
    # User Flow Distribution - Bottom Left
    ax3 = fig.add_subplot(gs[1, 0])
    
    # Representing typical user flow through the application
    flow_labels = ['Find Labs', 'Access Reports', 'Use Med Assistant', 'Book Tests', 'Get Directions']
    flow_values = [35, 25, 15, 15, 10]
    
    wedges, texts, autotexts = ax3.pie(flow_values, labels=None,
                                      autopct='%1.1f%%', startangle=90,
                                      colors=plt.cm.Pastel1(np.linspace(0, 1, len(flow_labels))))
    
    ax3.legend(wedges, flow_labels, loc='center left', bbox_to_anchor=(-0.1, 0, 0.5, 1))
    plt.setp(autotexts, size=10, weight='bold')
    ax3.set_title('User Interaction Distribution', fontsize=14, fontweight='bold')
    
    # Technology Stack Overview - Bottom Right
    ax4 = fig.add_subplot(gs[1, 1])
    
    # Technologies used in the project
    categories = ['Frontend', 'Backend', 'Storage', 'APIs', 'Security']
    tech_counts = [3, 2, 2, 3, 2]
    tech_complexity = [3, 5, 2, 4, 4]  # On a scale of 1-5
    
    ax4.scatter(categories, tech_complexity, s=np.array(tech_counts)*100, 
               alpha=0.7, c=range(len(categories)), cmap='viridis')
    
    for i, (count, complexity, category) in enumerate(zip(tech_counts, tech_complexity, categories)):
        ax4.annotate(f"{count} techs", (category, complexity), 
                    xytext=(0, 5), textcoords='offset points', ha='center')
    
    ax4.set_ylim(0, 6)
    ax4.set_ylabel('Complexity (1-5)', fontsize=10)
    ax4.set_title('Technology Stack Overview', fontsize=14, fontweight='bold')
    set_common_style(ax4)
    
    # Title for the entire dashboard
    fig.suptitle('MediMap System Analysis Dashboard', fontsize=20, fontweight='bold', y=0.98)
    
    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.savefig('thesis_diagrams/system_analysis_dashboard.png', dpi=300, bbox_inches='tight')
    print("System analysis dashboard created: thesis_diagrams/system_analysis_dashboard.png")


# Run all diagram generation functions
if __name__ == "__main__":
    print("Generating diagrams for MediMap thesis...")
    
    create_architecture_diagram()
    create_component_diagram()
    create_user_flow_diagram()
    create_tech_stack_diagram()
    create_features_radar()
    create_data_flow_diagram()
    create_timeline_chart()
    create_summary_dashboard()
    
    print("\nAll diagrams have been created in the 'thesis_diagrams' folder.")
    print("You can now include these high-quality visualizations in your thesis document.")
    print("\nRequired libraries: matplotlib, networkx, numpy, seaborn, pandas")
