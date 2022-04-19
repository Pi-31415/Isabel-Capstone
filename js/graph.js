//AJAX Request
var request;

var width = window.innerWidth,
  height = window.innerHeight,
  // var width = 960,
  //   height = 500,
  selected_node,
  selected_target_node,
  selected_link,
  new_line,
  circlesg,
  linesg,
  should_drag = false,
  drawing_line = false,
  nodes = [],
  links = [],
  link_distance = 90;

var zoomEnabled;
var allNodes;
var allLinks;
var showText = true;
var currentNodeText;
//Color Coding
function color(n) {
  var color_list = [
    "#3366cc",
    "#dc3912",
    "#ff9900",
    "#109618",
    "#990099",
    "#0099c6",
    "#dd4477",
    "#66aa00",
    "#b82e2e",
    "#316395",
    "#994499",
    "#22aa99",
    "#aaaa11",
    "#6633cc",
    "#e67300",
    "#8b0707",
    "#651067",
    "#329262",
    "#5574a6",
    "#3b3eac",
  ];
  return color_list[n % color_list.length];
}

var default_name = "Node";

var force = d3.layout
  .force()
  .charge(-340)
  .linkDistance(link_distance)
  .size([width, height]);

var zoom = d3.behavior.zoom().on("zoom", function () {
  svg.attr(
    "transform",
    "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"
  );
});

var svgRaw = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
//Activate the zoom
svgRaw.call(zoom);

var svg = svgRaw.append("g");

d3.select(window)
  .on("mousemove", mousemove)
  .on("mouseup", mouseup)
  .on("keydown", keydown)
  .on("keyup", keyup);

svg
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .on("mousedown", mousedown);

// Arrow marker
svg
  .append("svg:defs")
  .selectAll("marker")
  .data(["child"])
  .enter()
  .append("svg:marker")
  .attr("id", String)
  .attr("markerUnits", "userSpaceOnUse")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", link_distance / 2)
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

linesg = svg.append("g");
circlesg = svg.append("g");

$.ajax({
  url: "https://paingthet.com/UPLOAD/apps/CollectiveGaze/getLastFile.php",
  success: function (result) {
    //Remove Loader
    current_file_name =
      "https://paingthet.com/UPLOAD/apps/CollectiveGaze/backup/" + result;

    d3.json(current_file_name, function (json) {
      // decorate a node with a count of its children
      nodes = json.nodes;
      links = json.links;
      update();
      force = force.nodes(nodes).links(links);
      force.start();
      //Hide links
      allLinks.style("opacity", 0);
    });
  },
});

function update() {
  var link = linesg
    .selectAll("line.link")
    .data(links)
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    })
    .classed("selected", function (d) {
      return d === selected_link;
    });
  link
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("marker-end", "url(#child)")
    .on("mousedown", line_mousedown);
  link.exit().remove();

  allLinks = link;

  var node = circlesg
    .selectAll(".node")
    .data(nodes, function (d) {
      return d.name;
    })
    .classed("selected", function (d) {
      return d === selected_node;
    })
    .classed("selected_target", function (d) {
      return d === selected_target_node;
    });
  var nodeg = node
    .enter()
    .append("g") //Only show the text after over
    .on("mouseover", appendText)
    .on("mouseout", function () {
      // Remove the info text on mouse out.
      d3.select(this).select("text.info").remove();
    })
    .attr("class", "node")
    .call(force.drag)
    .attr("transform", function (d) {
      if (d.x == undefined) {
        d.x = 0;
      }
      if (d.y == undefined) {
        d.y = 0;
      }
      return "translate(" + d.x + "," + d.y + ")";
    });
  nodeg
    .append("circle")
    .attr("r", 10)
    .on("mousedown", node_mousedown)
    .on("mouseover", node_mouseover)
    .on("mouseout", node_mouseout)
    .style("fill", function (d) {
      return color(d.group); //Color the nodes differently according to category
    })
    .style("opacity", 0.8);

  allNodes = nodeg;
  //Append or not append text, we can choose
  nodeg
    .append("text")
    .classed("nodeText", true)
    .attr("x", 20)
    .attr("y", 10)
    .text(function (d) {
      return d.name;
    });

  node.exit().remove();

  force.on("tick", function (e) {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
    node.attr("transform", function (d) {
      if (d.x == undefined) {
        d.x = 0;
      }
      if (d.y == undefined) {
        d.y = 0;
      }
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
}

function appendText(d) {
  var g = d3.select(this); // The node
  // The class is used to remove the additional text later
  // This highlights the text
  var info = g
    .append("text")
    .classed("info", true)
    .attr("x", 20)
    .attr("y", 10)
    .text(function (d) {
      return d.name;
    });
}

// select target node for new node connection
function node_mouseover(d) {
  if (drawing_line && d !== selected_node) {
    // highlight and select target node
    selected_target_node = d;
  }
}

function node_mouseout(d) {
  if (drawing_line) {
    selected_target_node = null;
  }
}

function zoomToNode(d) {
  if (should_drag == false) {
    var translate = [
      width / 2 - zoom.scale() * d.x,
      height / 2 - zoom.scale() * d.y,
    ];
    svg
      .transition()
      .duration(750)
      .call(zoom.translate(translate).scale(zoom.scale()).event);
  }
}

// select node / start drag
function node_mousedown(d) {
  showText = !showText;
  //Clear other texts and append
  var g = d3.select(this); // The node
  // The class is used to remove the additional text later
  var info = g
    .append("text")
    .classed("info", true)
    .attr("x", 20)
    .attr("y", 10)
    .text(d.name);

  //Zoom to that node, when clicked
  zoomToNode(d);
  if (!drawing_line) {
    selected_node = d;
    showInfo(d);
    selected_link = null;
  }
  if (!should_drag) {
    d3.event.stopPropagation();
    drawing_line = true;
  }
  //Pinning the node. Change to true if you want to pin.
  d.fixed = false;
  force.stop();
  //Process the highlight
  //Reduce the opacity of all but the neighbouring nodes
  d = d3.select(this).node().__data__;
  currentNodeText = d;
  allNodes.style("opacity", function (o) {
    return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
  });

  allLinks.style("opacity", function (o) {
    return (d.index == o.source.index) | (d.index == o.target.index) ? 1 : 0.1;
  });
  update();
}

// select line
function line_mousedown(d) {
  selected_link = d;
  selected_node = null;
  update();
}

// draw yellow "new connector" line
function mousemove() {
  if (drawing_line && !should_drag) {
    var m = d3.mouse(svg.node());
    var x = Math.max(0, Math.min(width, m[0]));
    var y = Math.max(0, Math.min(height, m[1]));
    // debounce - only start drawing line if it gets a bit big
    var dx = selected_node.x - x;
    var dy = selected_node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      // draw a line
      if (!new_line) {
        new_line = linesg.append("line").attr("class", "new_line");
      }
      new_line
        .attr("x1", function (d) {
          return selected_node.x;
        })
        .attr("y1", function (d) {
          return selected_node.y;
        })
        .attr("x2", function (d) {
          return x;
        })
        .attr("y2", function (d) {
          return y;
        });
    }
  }
  update();
}

// add a new disconnected node, upon button click
var addNode = function (Title, fileName, Name, Type, TypeName, Content) {
  var date = new Date();
  var currentNode = {
    name: Title,
    group: Type,
    image: fileName,
    type: TypeName,
    author: Name,
    date: date.toLocaleString(),
    text: Content,
    x: width / 2,
    y: height / 2,
  };
  nodes.push(currentNode);
  selected_node = currentNode;
  selected_link = null;
  force.stop();
  update();
  force.start();
  saveJSON();
};

// switch between drag mode and add mode
function mousedown() {
  if (selected_node != null) {
    //Reset the line display
    allNodes.style("opacity", 1);
    allLinks.style("opacity", 0);
    toggle = 0;
  }
  //Also clear all the texts
  d3.selectAll("text.info").remove();
  //Reset the nodes
  selected_node = null;
  selected_link = null;
  if (selected_node == null) {
    $("#imageCard").fadeOut();
  }
  update();
  force.start();
}

// end node select / add new connected node
function mouseup() {
  drawing_line = false;
  if (new_line) {
    if (selected_target_node) {
      selected_target_node.fixed = false;
      var new_node = selected_target_node;
    } else {
      var m = d3.mouse(svg.node());
      var new_node = {
        x: m[0],
        y: m[1],
        name: default_name + " " + nodes.length,
        group: 1,
      };
      nodes.push(new_node);
    }
    selected_node.fixed = false;
    links.push({ source: selected_node, target: new_node });
    //Update the links
    saveJSON();
    selected_node = selected_target_node = null;
    update();
    setTimeout(function () {
      new_line.remove();
      new_line = null;
      force.start();
    }, 300);
  }
}

function keyup() {
  switch (d3.event.keyCode) {
    case 16: {
      // shift
      should_drag = false;
      svgRaw.call(zoom);
      update();
      force.start();
    }
  }
}

// select for dragging node with shift; delete node with backspace
function keydown() {
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: {
      // delete
      if (selected_node) {
        // deal with nodes
        var i = nodes.indexOf(selected_node);
        nodes.splice(i, 1);
        // find links to/from this node, and delete them too
        var new_links = [];
        links.forEach(function (l) {
          if (l.source !== selected_node && l.target !== selected_node) {
            new_links.push(l);
          }
        });
        links = new_links;
        selected_node = nodes.length ? nodes[i > 0 ? i - 1 : 0] : null;
      } else if (selected_link) {
        // deal with links
        var i = links.indexOf(selected_link);
        links.splice(i, 1);
        selected_link = links.length ? links[i > 0 ? i - 1 : 0] : null;
      }
      //Save JSON after deletion
      saveJSON();
      $("#imageCard").fadeOut();
      update();
      break;
    }
    case 16: {
      // shift
      should_drag = true;
      svgRaw.on(".zoom", null);
      break;
    }
  }
}

//GUI
//Show Information
function showInfo(d) {
  $("#titleText").html(d.name);
  $("#contentText").html(d.text);
  $("#contentAuthor").html(d.author);
  //$("#contentDate").html(d.date);
  //If there is no author, don't show the author info
  if (d.author == "None") {
    $("#authorInfo").hide();
  } else {
    $("#authorInfo").show();
  }
  //If there is no image, don't show
  if (d.image == "None" || d.image == undefined) {
    $("#cardImageContainer").hide();
    $("#cardImageSource").attr("src", "./upload/white_image.png");
  } else {
    $("#cardImageSource").attr("src", "./upload/" + d.image);
    $("#cardImageContainer").fadeIn();
  }
  $("#imageCard").fadeIn();
}

$(document).ready(function () {
  $("#imageCard").hide();
  //Disable Links
  if (allLinks != undefined) {
    allLinks.style("opacity", 0);
  }
});

$(document).on("click", "a", function () {
  var href = $(this).attr("href");
  if (href == "#addNode") {
    //Submit();
  } else if (href == "#openText") {
    //For Text
    $("#imageUploadForm").hide();
    localStorage.setItem("fileName", "None");
    //Hide content form
    $("#contentForm").fadeIn();
  } else if (href == "#openImage") {
    //For Image
    $("#imageUploadForm").show();
    $("#contentForm").fadeIn();
  } else if (href == "#Submit") {
    Submit();
  } else if (href == "#OpenDialogue") {
  }
});

//Graph Traversal
//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < nodes.length; i++) {
  linkedByIndex[i + "," + i] = 1;
}
links.forEach(function (d) {
  linkedByIndex[d.source.index + "," + d.target.index] = 1;
});
//This function looks up whether a pair are neighbours
function neighboring(a, b) {
  return linkedByIndex[a.index + "," + b.index];
}

//Saving Functions
function saveJSON() {
  //console.log(nodes);
  //Node Parser
  var sourceid, targetid;
  var parsedlink = [];
  for (var j = 0; j < links.length; j++) {
    //console.log(links[j].source.name);
    for (var i = 0; i < nodes.length; i++) {
      //console.log(nodes[i].name);
      if (nodes[i].name == links[j].source.name) {
        sourceid = i;
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      //console.log(nodes[i].name);
      if (nodes[i].name == links[j].target.name) {
        targetid = i;
      }
    }
    parsedlink.push({ source: sourceid, target: targetid });
  }
  //console.log(links);
  //console.log(parsedlink);
  var file_contents = JSON.stringify({
    nodes: nodes,
    links: parsedlink,
  });
  //console.log(file_contents);
  $.post(
    "https://paingthet.com/UPLOAD/apps/CollectiveGaze/fileHandler.php",
    {
      content: file_contents,
    },
    function (data, status) {
      console.log("Saving " + status);
    }
  );
}

function Submit() {
  var fileName = localStorage.getItem("fileName");
  if (fileName == null) {
    localStorage.setItem("fileName", "None");
  }
  var Name = $("#first_name").val();
  var Content = $("#textarea1").val();
  var Title = $("#title").val();
  if (Name == "") {
    Name = "None";
  }
  var Type = localStorage.getItem("type");
  var TypeName = localStorage.getItem("typeName");
  console.log(fileName);
  console.log(Name);
  console.log(Type);
  console.log(TypeName);
  //Add Node Finally
  if (Title == "") {
    alert("No Title Given. Please put a title.");
  } else {
    addNode(Title, fileName, Name, Type, TypeName, Content);
    //Hide content form
    $("#contentForm").fadeOut();
  }
}
