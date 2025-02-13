(function () {

    function init(e) { }
    function mouseMove(e) { }
    function mouseUp(e) { }

    var cluster2
    var leafNodes = []

    var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

    var vis2

    function mouseDown(e) {
	var node = d3.select(e.target)
	if (!node) return
	var id = node.attr("id")
	if (!id) return
	window.selectedId = id
	nodeMap[id].hidden = !nodeMap[id].hidden
	leafNodes = []
	showTree(getTree(fullTree))
	updateGraph(id, leafNodes)
	updateText(id)
    }

    function getFixtures() {
	var classes = []
	$.each(fixtureMap, function (i, v) {
	    classes.push({name: i, imports: []})
	})
	    return classes
    }

    function getKids(node) {
	var elts = node.elts
	if (!elts) {
	    return [node]
	}
	var classes = []
	$.each(elts, function (i, v) {
	    classes.push({name: i, imports: []})
	})
	    return classes
    }

    function getTree(node) {
	var kids = []
	if ($.isArray(node)) {
	    $.each(node, function(i, v) {
		var t = getTree(v)
		if ($.isArray(t)) {
		    kids = kids.concat(t)
		}
		else {
		    kids.push(t)
		}
	    });
	    return kids
	}
	else
	    if (node.id && node.edges) {
		if (node.edges.length === 0 || nodeMap[node.id].hidden) {
		    leafNodes.push(node.id)
		}

		if (!nodeMap[node.id].hidden) {
		    $.each(node.edges, function(i, v) {
			var t = getTree(v)
			if ($.isArray(t)) {
			    kids = kids.concat(t)
			}
			else {
			    kids.push(t)
			}
		    });
		}
		return {name: node.id, label: node.class, children: kids}
	    }
	else
	    if (node.edges) {
		$.each(node.edges, function(i, v) {
		    var t = getTree(v)
		    if ($.isArray(t)) {
			kids = kids.concat(t)
		    }
		    else {
			kids.push(t)
		    }
		});
		leafNodes.push(v.id)
		return kids
	    }
	else {
            return []
	}
    }

    var width = 750
    this.canvasWidth = width
    
    function showTree(tree) {
	var height = leafNodes.length * 15

	if (height < 1000) 
	    this.canvasHeight = 1000
	else
	    this.canvasHeight = height

	cluster2 = d3.layout.cluster()
	    .size([height, width - 250]);

	var nodes = cluster2.nodes(tree);


	var vis = d3.select(".main")
	    .attr("width", this.canvasWidth)
	    .attr("height", this.canvasHeight)

	if (vis2)
	    vis2.remove()

	vis2 = vis.append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .append("g")
	    .attr("transform", "translate(70, 0)");

	var link = vis2.selectAll("path.link")
	    .data(cluster2.links(nodes))
            .enter().append("path")
	    .attr("class", "link")
	    .attr("d", diagonal);

	var node = vis2.selectAll("g.node")
	    .data(nodes)
	    .enter().append("g")
	    .attr("class", "node")
	    .attr("id", function(d) { return d.name })
	    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

	node.append("circle")
	    .attr("fill", function (d) { 
		return isTerminal(d.name) ? "red" : 
		    //		   isSelected(d.name) ? "rgb(2,139,167)" : 
		    "" })
	    .attr("r", function(d) { return isSelected(d.name) ? 3.5 : 2  })

	node.append("circle")
	    .attr("fill", function (d) { 
		return isSelected(d.name) ? "#fff" : 
		    "" })
	    .attr("r", function(d) { return isSelected(d.name) ? 2 : 0  })

	node.append("text")
	    .attr("dx", function(d) { return (d.children && d.children.length) ? 0 : 5; })
	    .attr("dy", function(d) { return (d.children && d.children.length) ? 8 : 2; })
	    .attr("text-anchor", function(d) { return (d.children && d.children.length) ? "end" : "start"; })
	    .attr("id", function(d) { return d.name })
	    .text(function(d) {
		return (d.children && d.children.length) ? d.label : getLabel2(d.name)
	    });

    }

    var leafNodeIds = []

    function getLabel2(id) {
	var node = nodeMap[id]
	leafNodeIds.push(id)
	switch (node.class) {
	case "Fixture":
	    return node.class + ": " + node.elts[1].elts[0]
	case "Name":
	    return node.class + ": "+node.elts[0]
	case "Identifier":
	case "LiteralString":
	case "LiteralBoolean":
	case "LiteralInt":
	    return node.class + ": " + node.elts[0]
	default:
	    return node.class
	}
    }

    function isTerminal(id) {
	var node = nodeMap[id]
	switch (node.class) {
	case "Identifier":
	case "LiteralString":
	case "LiteralBoolean":
	case "LiteralInt":
	case "Name":
	case "ThisExpr":
	    return true
	case "Head":
	    if (node.elts[0].length===0) { return true } else { return false }
	    break
	default:
	    return false
	}
    }

    function isSelected(id) {
	return window.selectedId === id
    }

    function startTree() {
	d3.json(mapName+".js.l7.l9.l12", function(tree) {
	    fullTree = tree
	    showTree(getTree(fullTree))  
	})
    }

    // exports

    this.init = init
    this.mouseMove = mouseMove
    this.mouseUp = mouseUp
    this.mouseDown = mouseDown
    this.startTree = startTree
    this.isSelected = isSelected
})()