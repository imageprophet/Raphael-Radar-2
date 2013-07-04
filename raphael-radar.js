/**
 * Raphael Radar - JavaScript library to draw a controlable radar chart using Raphael.js
 *
 * Licensed under the MIT.
 * This library is a customized from Original version: https://github.com/jsoma/raphael-radar
 */
(function () {
  // Gets a position on a radar line.
  function lined_on(origin, base, bias) {
    return origin + (base - origin) * bias;
  }

  // Gets SVG path string for a group of scores.
  function path_string(center, points, scores, cc) {
    var vertex = [], rvertex = [];
    if(!cc) {
      for (var i = 0; i < points.length; i++) {
          var x = lined_on(center.x, points[i].x, scores[i].value);
          var y = lined_on(center.y, points[i].y, scores[i].value);

          vertex.push("" + x + " " + y); 
      }
    } else {
      for (var i = (points.length-1); i >= 0; i--) {
          var y = lined_on(center.x, points[i].x, scores[i].value);
          var x = lined_on(center.y, points[i].y, scores[i].value);

          vertex.push("" + y + " " + x); 
      }

    }

    return "M " + vertex.join("L ") + "L " + vertex[0];
  }

  function Radar(raphael, cx, cy, radius, labels, min_score, max_score, score_groups, alt_labels, user_draw_options) {
    var self = this;

    self.raphael = raphael;
    self.chart = {};
    self.points = [];
    self.cx = cx;
    self.cy = cy;
    self.radius = radius;
    self.bottom = 0;
    self.min_score = min_score;
    self.max_score = max_score;
    self.labels = labels;
    self.alt_labels = ((alt_labels != null) ? alt_labels : "");
    self.score_groups = score_groups;
    self.user_draw_options = user_draw_options;
    self.global_draw_defaults = {
      text: {
        fill: "#222",
        "max-chars": 10
      },
      legend: {
        "key": true,
        "key_position": "n",
        "key_line_length": 50
      },
      show_ruler_text: false,
      ruler_type: "line" // could be "line" or "dash" defaults to line
    };
    self.global_draw_options = $.extend(true, self.global_draw_defaults, user_draw_options);
  }

  Radar.prototype.draw = function () {
    var self = this;

    self.drawChartFrame();
    self.drawMeasures();
    self.drawScore();
    self.drawLabel();
  };

  /**
   * Draws a polygon.
   *
   * @param {Array} points Point array of polygon.
   */
  Radar.prototype.polygon = function (points) {
    var self = this;

    // Initial parameter makes an effect... mysterious...
    var path_string = "M 100 100";
    var i, length = points.length, x, y, s;

    for (i = 0; i < length; ++i) {
      x = points[i].x;
      y = points[i].y;
      s = (i == 0) ? "M " + x + " " + y + " " : "L " + x + " " + y + " ";
      if (i === length - 1) {
        s += "L " + points[0].x + " " + points[0].y + " ";
      }
      path_string += s;
    }

    return self.raphael.path(path_string);
  };

  /**
   * Genarates points of the chart frame
   */
  Radar.prototype.drawChartFrame = function () {
    var self = this;

    var sides = self.labels.length;
    var steps = [], ruler_points = [];
    var angle = -90;
    var j, i, x, y, rad;

    self.bottom = 0;
    for (i = 0; i < sides; i++) {
      rad = (angle / 360.0) * (2 * Math.PI);
      x = self.cx + self.radius * Math.cos(rad);
      y = self.cy + self.radius * Math.sin(rad);
      self.points.push({ x: x, y: y });
      angle += 360.0 / sides;

      if (y > self.bottom) {
        self.bottom = y;
      }
    }

    // Draws a frame of the chart and sets styles it
    self.chart["frame"] = self.polygon(self.points).attr({ "stroke": "#777" });

  };

  /**
   * Draws measures of the chart.
   */
  Radar.prototype.drawMeasures = function () {
    var self = this;

    var points = self.points;
    var measures = [], rulers = [], ruler_text = [];
    var i, j, length = points.length, x, y, x1, x2, y1, y2, cl, text;
    var scale = (self.max_score - self.min_score) / 10;
    var r_len = 0.035;

    var angle = -90;
    var d, lx, ly, rad, dist, bottom;
    var center = { x: self.cx, y: self.cy };


    for (i = 0; i < length; ++i) {
      x = points[i].x;
      y = points[i].y;
      measures.push(self.raphael.path("M " + self.cx + " " + self.cy + " L " + x + " " + y).attr("stroke", "#777"));

      // Draws ruler and label
      rulers[i] = [];
      for (j = 0; j <= 10; ++j) {

          x1 = lined_on(self.cx, points[i].x, j * 0.10 - r_len);
          y1 = lined_on(self.cy, points[i].y, j * 0.10 - r_len);
          x2 = lined_on(self.cx, points[i].x, j * 0.10 + r_len);
          y2 = lined_on(self.cy, points[i].y, j * 0.10 + r_len);

        if(self.global_draw_defaults.ruler_type === "dash") {
          if (j !== 0 && j !== 10) {
            cl = self.raphael.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2).attr({ "stroke": "#ccc" });
            cl.rotate(90);
            rulers[i].push(cl);
          }
        } 


        if(self.global_draw_defaults.show_ruler_text) {
          if (i === 0) {
            text = self.raphael.text(x1 - 7, y2, self.min_score + j * scale).attr($.extend(true, self.global_draw_options["text"], { "text-anchor": "end" }));
            ruler_text.push(text);
          }
        }
        
      }

    } 

    if (self.global_draw_defaults.ruler_type === "line") {
      for (j = 0; j <= 10; ++j) {
        var ruler_points = [], d;
        rulers[j] = [];

        for (d = 0; d < length; d++) {
          ruler_points.push({ 
            value: (j - self.min_score) / (self.max_score - self.min_score),
            rawValue: j
          });
        }

        if (j !== 0 && j !== 10) {
          rulers[j].push(self.raphael.path(path_string(center, points, ruler_points)).attr({ "stroke": "#ccc" }) );
        }        
      }
    }
    
    self.chart["measures"] = measures;
    self.chart["rulers"] = rulers;
    self.chart["ruler_text"] = ruler_text;
  };

  /**
   * Draws scores.
   */
  Radar.prototype.drawScore = function () {
    var self = this;

    var i, j, x, y, x1, x2, y1, y2, x3, y3, title, line, point, text, value;
    var draw_options;
    var default_draw_options = {
      points: {"fill": "#333", "stroke-width": "0", "size": 4.5},
      text: {"fill": "#222", "text-anchor": "start"},
      lines: {"stroke-width": "1" }
    };
    var key_length = self.global_draw_options["legend"]["key_line_length"];
    var length = self.score_groups.length;
    var points = self.points;
    var center = { x: self.cx, y: self.cy };

    var score_groups = self.score_groups;
    var labels = self.labels;

    self.chart["scores"] = [];

    for (i = 0; i < length; ++i) {
      var scores = [];
      var min_scores = [];
      var vector = {};
      var v_points = [];

      draw_options = $.extend(true, default_draw_options, score_groups[i]["draw_options"]);

      // If a score_groups object doesn"t respond to "scores",
      // loop through the labels attribute to try querying the
      // keys on the object
      if (score_groups[i].scores) {
        for (j = 0; j < score_groups[i].scores.length; ++j) {
          scores.push({
            value: (score_groups[i].scores[j] - self.min_score) / (self.max_score - self.min_score),
            rawValue: score_groups[i].scores[j],
            label: self.labels[j]
          });
        }
      } else {
        for (j = 0; j < labels.length; ++j) {
          value = score_groups[i][labels[j]] || score_groups[i][labels[j].toLowerCase().replace(" ", "_")];
          scores.push({
            value: (value - self.min_score) / (self.max_score - self.min_score),
            rawValue: value,
            label: labels[j]
          });
        }
      }

      // If min scores are found assumes scores and uses labels from self
      if (score_groups[i].min_scores) {
        for (j = 0; j < score_groups[i].min_scores.length; ++j) {
          min_scores.push({
            value: (score_groups[i].min_scores[j] + self.min_score) / (self.max_score + self.min_score),
            rawValue: score_groups[i].min_scores[j],
            label: self.labels[j]
          });
        }
      }

      title = score_groups[i].title;

      // Add min path if it exists
      var min_path = "";
      if (score_groups[i].min_scores) {
        min_path = path_string(center, points, min_scores, true);
      } 

      line = self.raphael.path(path_string(center, points, scores) + min_path).attr(draw_options["lines"]).node.id = title.replace(" ", "_");
      vector["line"] = line;

      // Draws points for chart
      for (j = 0; j < scores.length; j++) {
        x = lined_on(self.cx, points[j].x, scores[j].value);
        y = lined_on(self.cy, points[j].y, scores[j].value);

        var pointTitle = title.replace(" ", "_") + "_" + j;
        point = self.raphael.circle(x, y, draw_options["points"]["size"]).attr(draw_options["points"]);        
        point.score = scores[j];
        point.title = title;
        point.node.id = pointTitle;
        v_points.push(point);
      }

      // If min_scores are found draws min scores points
      if(score_groups[i].min_scores) {
        for (j = 0; j < scores.length; j++) {
          x = lined_on(self.cx, points[j].x, min_scores[j].value);
          y = lined_on(self.cy, points[j].y, min_scores[j].value);

          var pointTitle = title.replace(" ", "_") + "_min_" + j;
          point = self.raphael.circle(x, y, draw_options["points"]["size"]).attr(draw_options["points"]);        
          point.score = min_scores[j];
          point.title = title;
          point.node.id = pointTitle;
          v_points.push(point);
        }
      }
      vector["points"] = v_points;

      var score_title = title;
      var half_title_mid = ((score_title.length *0.5) * 5) 
      // title with line sample
      if (title && self.global_draw_options["legend"]["key"]) {
        switch (self.global_draw_options["legend"]["key_position"]) {
          case "n":
            x1 = ((self.cx + ((length * 40 + key_length)/2)) - (((length * 40 + key_length)/2)) * i) - key_length;
            y1 = 10;
            x2 = ((self.cx + ((length * 40 + key_length)/2)) - (((length * 40 + key_length)/2)) * i);
            y2 = y1;
            x3 = x1;
            y3 = y1 + 10;
          break;
          case "ne":
            x1 = (self.cx * 2 - 60) - key_length;
            y1 = 10 + 20 * i;
            x2 = self.cx * 2 - 60;
            y2 = y1;
            x3 = x2 + 10;
            y3 = y1;
          break;
          case "nw":
            x1 = 10;
            y1 = 10 + 20 * i;
            x2 = 10 + key_length;
            y2 = y1;
            x3 = x2 + 10;
            y3 = y1;
          break;
          case "w":
            x1 = 20 - key_length;
            y1 = (self.cy - ((length * 25)/2)) + ( 25 * i);
            // console.log( "cy:" + self.cy + " " + ((length * 25)*0.5) + " " + ((self.cy - ((length * 25)/2)) + ( 25 * i)) );
            x2 = 20;
            y2 = y1;
            x3 = x1 - half_title_mid;
            y3 = y1 + 10;
          break;
          case "e":
            x1 = (self.cx * 2 - 20) - key_length;
            y1 = (self.cy - ((length * 25)/2)) + ( 25 * i);
            x2 = (self.cx * 2 - 20);
            y2 = y1;
            x3 = x1 - half_title_mid;
            y3 = y1 + 10;
          break;
          case "se":
            x1 = (self.cx * 2 - 60) - key_length;
            y1 = self.bottom - 10 + 20 * i;
            x2 = (self.cx * 2 - 60);
            y2 = y1;
            x3 = x2 + 10;
            y3 = y1;
          break;
          case "sw":
            x1 = 10 - key_length;
            y1 = self.bottom - 10 + 20 * i;
            x2 = 10;
            y2 = y1;
            x3 = x2 + 10;
            y3 = y1;
          break;
          case "s":
            x1 = ((self.cx + ((length * 40 + key_length)/2)) - (((length * 40 + key_length)/2)) * i) - key_length;
            y1 = self.bottom + 40;
            x2 = ((self.cx + ((length * 40 + key_length)/2)) - (((length * 40 + key_length)/2)) * i);
            y2 = y1;
            x3 = x1;
            y3 = y1 + 10;
          break;
        }
        line = self.raphael.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2).attr(draw_options["lines"]);
        point = self.raphael.circle(x1, y1, draw_options["points"]["size"]).attr(draw_options["points"]);
        text = self.raphael.text(x3, y3, score_title).attr(draw_options["text"]);
        vector["title"] = { line: line, point: point, text: text };
      }
      self.chart["scores"].push(vector);
    }
  };

  /**
   * Draws labels
   */
  Radar.prototype.drawLabel = function () {
    var self = this;

    var points = self.points;
    var length = points.length;
    var i, x, y, label, text, anchor;

    var chartLabels = ((self.alt_labels.length == self.labels.length) ? self.alt_labels : self.labels);

    self.chart["labels"] = [];
    for (i = 0; i < length; ++i) {
      anchor = "middle";
      x = lined_on(self.cx, points[i].x, 1.1);
      y = lined_on(self.cy, points[i].y, 1.1);
      if (x > self.cx) anchor = "start";
      if (x < self.cx) anchor = "end";

      // label = self.labels[i];
      label = chartLabels[i];
      
      if (label.length > self.global_draw_options["text"]["max-chars"]) {
        label = label.replace(" ", "\n");
      }
      text = self.raphael.text(x, y, label).attr($.extend(true, self.global_draw_options["text"], { "text-anchor": anchor }));
      self.chart["labels"].push(text);
    }
  };

  /**
   * Draws a radarchart.
   *
   * @param cx x coodinates of center.
   * @param cy y coodinates of center.
   * @param radius radius of the radar chart. you may need more height and width for labels.
   * @param labels labels of axes. e.g. ["Speed", "Technic", "Height", "Stamina", "Strength"]
   * @param min_score minimum score.
   * @param max_score maximum score.
   * @param score_groups groups has 1+ group(s) of scores and name.
   * @param user_draw_options other options you want to use
   */
  // Raphael.fn.radarchart = function (cx, cy, radius, labels, min_score, max_score, score_groups, alt_labels, user_draw_options) {
  Raphael.fn.radarchart = function (width, height, labels, min_score, max_score, score_groups, alt_labels, user_draw_options) {
    var cx = width/2;
    var cy = height/2;
    var radius = ( (cx <= cy) ? (cx - (cx*0.15)) : (cy - (cy*0.15)) );

    var radar = new Radar(this, cx, cy, radius, labels, min_score, max_score, score_groups, alt_labels, user_draw_options);
    radar.draw();
    return radar.chart;
  };

})();