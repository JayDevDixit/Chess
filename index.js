const all_blocks = Array.from(document.getElementsByClassName("block"));

const matrix_path = [
  all_blocks.slice(0, 8),
  all_blocks.slice(8, 16),
  all_blocks.slice(16, 24),
  all_blocks.slice(24, 32),
  all_blocks.slice(32, 40),
  all_blocks.slice(40, 48),
  all_blocks.slice(48, 56),
  all_blocks.slice(56, 64),
];

// contain div which are on target by enemies
let danger_zone_Black_king = [];
let danger_zone_white_king = [];

ready_board();
// All Alive Pieces
all_pieces = Array.from(document.getElementsByTagName("p"));
all_black_pieces = Array.from(document.getElementsByClassName("black-troop"));
all_white_pieces = Array.from(document.getElementsByClassName("white-troop"));
selected_piece = undefined;
selected_block = undefined;
invalid_move = undefined;
valid_moves = [];
killed_white = [];
killed_black = [];
extreme_position_y = [
  0, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55, 56, 63,
];
extreme_position_left = [0, 8, 16, 24, 32, 40, 48, 56];
extreme_position_right = [7, 15, 23, 31, 39, 47, 55, 63];

extreme_position_x = [0, 1, 2, 3, 4, 5, 6, 7, 56, 57, 58, 59, 60, 61, 62, 63];
extreme_position_top = [0, 1, 2, 3, 4, 5, 6, 7];
extreme_position_bottom = [56, 57, 58, 59, 60, 61, 62, 63];

computer_turn = false;
let max_troop_no = {
  "black-queen": 1,
  "black-bishop": 2,
  "black-rook": 2,
  "black-knight": 2,

  "white-queen": 1,
  "white-bishop": 2,
  "white-rook": 2,
  "white-knight": 2,
};
first_move = {
  "black-king": 1,
  "black-pawn-1": 1,
  "black-pawn-2": 1,
  "black-pawn-3": 1,
  "black-pawn-4": 1,
  "black-pawn-5": 1,
  "black-pawn-6": 1,
  "black-pawn-7": 1,
  "black-pawn-8": 1,
  "white-king": 1,
  "white-pawn-1": 1,
  "white-pawn-2": 1,
  "white-pawn-3": 1,
  "white-pawn-4": 1,
  "white-pawn-5": 1,
  "white-pawn-6": 1,
  "white-pawn-7": 1,
  "white-pawn-8": 1,
};

for (let i of all_pieces) {
  i.addEventListener("click", click_on_troop);
}

for (let i of all_blocks) {
  i.addEventListener("click", (event) => {
    if (event.target.innerHTML == "" && selected_piece != undefined) {
      selected_block = event.target;
      invalid_move = true;
      for (i of valid_moves) {
        if (i == selected_block) {
          move(selected_piece, selected_block);
          selected_piece_id = selected_piece.getAttribute("id");
          selected_piece = undefined;
          selected_block = undefined;
          invalid_move = false;
          break;
        }
      }
      if (invalid_move) console.log("->Invalid Move<-");
    }
  });
}

function ready_board() {
  toggle = true;
  k = 1;
  for (let i of all_blocks) {
    if (toggle) i.classList.add("white");
    else i.classList.add("black");
    if (k % 8 != 0) toggle = !toggle;
    k += 1;
  }
}
function move(selected_piece, selected_block) {
  // animate_movement(selected_piece, selected_block);
  let piece_name = selected_piece.getAttribute("id");
  selected_piece.parentNode.innerHTML = "";
  selected_block.appendChild(selected_piece);
  if (first_move[piece_name] == 1) first_move[piece_name] = 0;
  computer_turn = !computer_turn;
  if (computer_turn) computer_move();

  if (
    piece_name.startsWith("white-pawn-") &&
    check_in(all_blocks.indexOf(selected_block), extreme_position_top)
  ) {
    console.log("white Pawn need to transform");
    transform_pawn(selected_piece, selected_block, "white");
  }
  if (
    piece_name.startsWith("black-pawn-") &&
    check_in(all_blocks.indexOf(selected_block), extreme_position_bottom)
  ) {
    console.log("Black Pawn need to transform");
    transform_pawn(selected_piece, selected_block, "black");
  }

  compute_danger_zone();
  // reset_animation(selected_piece)
}

function find_valid_moves(selected_piece) {
  selected_piece_id = selected_piece.getAttribute("id");
  //   black-pawns
  if (selected_piece_id.startsWith("black-pawn-")) {
    index = all_blocks.indexOf(selected_piece.parentNode);
    attack = [];

    if (first_move[selected_piece_id] == 1) {
      if (check_in(index, extreme_position_left))
        exp_attack = [index + 9, index + 17];
      else if (check_in(index, extreme_position_right))
        exp_attack = [index + 7, index + 15];
      else exp_attack = [index + 7, index + 9, index + 15, index + 17];
      for (let i of exp_attack) {
        x = all_blocks[i].firstElementChild;
        if (x != null)
          if (x.getAttribute("id").startsWith("white-"))
            attack.push(all_blocks[i]);
      }
      normal_path = [];
      x = [all_blocks[index + 8], all_blocks[index + 16]];
      for (let i of x) {
        if (i.firstElementChild == null) normal_path.push(i);
        else break;
      }

      return normal_path.concat(attack);
    } else {
      let exp_attack = [];
      if (check_in(index, extreme_position_left)) {
        if (index + 9 < 64) exp_attack.push(index + 9);
      } else if (check_in(index, extreme_position_right)) {
        if (index + 7 < 64) exp_attack.push(index + 7);
      } else {
        if (index + 7 < 64) exp_attack.push(index + 7);
        if (index + 9 < 64) exp_attack.push(index + 9);
      }

      for (let i of exp_attack) {
        x = all_blocks[i].firstElementChild;
        if (x != null)
          if (x.getAttribute("id").startsWith("white-"))
            attack.push(all_blocks[i]);
      }
      normal_path = [];
      if (index + 8 < 64 && all_blocks[index + 8].firstElementChild == null)
        normal_path.push(all_blocks[index + 8]);
      return normal_path.concat(attack);
    }
  }
  // white-pawns
  if (selected_piece_id.startsWith("white-pawn-")) {
    index = all_blocks.indexOf(selected_piece.parentNode);
    attack = [];

    if (first_move[selected_piece_id] == 1) {
      if (check_in(index, extreme_position_left))
        exp_attack = [index - 7, index - 15];
      else if (check_in(index, extreme_position_right))
        exp_attack = [index - 9, index - 17];
      else exp_attack = [index - 7, index - 9, index - 15, index - 17];
      for (let i of exp_attack) {
        x = all_blocks[i].firstElementChild;
        if (x != null)
          if (x.getAttribute("id").startsWith("black-"))
            attack.push(all_blocks[i]);
      }
      normal_path = [];
      x = [all_blocks[index - 8], all_blocks[index - 16]];
      for (let i of x) {
        if (i.firstElementChild == null) normal_path.push(i);
        else break;
      }
      return normal_path.concat(attack);
    } else {
      if (check_in(index, extreme_position_left)) exp_attack = [index - 7];
      else if (check_in(index, extreme_position_right))
        exp_attack = [index - 9];
      else exp_attack = [index - 7, index - 9];

      for (let i of exp_attack) {
        x = all_blocks[i].firstElementChild;
        if (x != null)
          if (x.getAttribute("id").startsWith("black-"))
            attack.push(all_blocks[i]);
      }
      normal_path = [];
      if (all_blocks[index - 8].firstElementChild == null)
        normal_path.push(all_blocks[index - 8]);
      return normal_path.concat(attack);
    }
  }

  if (
    selected_piece_id.startsWith("black-rook-") ||
    selected_piece_id.startsWith("white-rook-")
  )
    return find_straight_path(selected_piece);

  if (
    selected_piece_id.startsWith("black-bishop-") ||
    selected_piece_id.startsWith("white-bishop-")
  )
    return find_diagonal_path(selected_piece);

  if (
    selected_piece_id.startsWith("black-queen") ||
    selected_piece_id.startsWith("white-queen")
  )
    return find_diagonal_path(selected_piece).concat(
      find_straight_path(selected_piece)
    );

  if (
    selected_piece_id.startsWith("black-knight-") ||
    selected_piece_id.startsWith("white-knight-")
  )
    return find_L_path(selected_piece);

  return [];
}

function find_L_path(selected_piece) {
  let selected_piece_id = selected_piece.getAttribute("id");
  let index = all_blocks.indexOf(selected_piece.parentNode);
  let row_index = undefined;
  let col_index = undefined;
  for (row of matrix_path)
    if (check_in(all_blocks[index], row)) {
      row_index = matrix_path.indexOf(row);
      col_index = row.indexOf(all_blocks[index]);
      break;
    }
  let valid_path = [];
  let x = [
    [-2, -1],
    [-2, 1],
    [2, 1],
    [2, -1],
    [-1, 2],
    [-1, -2],
    [1, 2],
    [1, -2],
  ];
  for (let i of x) {
    let a = row_index + i[0];
    let b = col_index + i[1];
    if (a >= 0 && a <= 7 && b >= 0 && b <= 7)
      check_path(a, b, valid_path, selected_piece_id);
  }
  return valid_path;
}

// i,j is index if matrix_path to check if block is occupied
// with same color-troop or not
// selected_piece_id is color of piece you want to move
function check_path(i, j, valid_path, selected_piece_id) {
  let x = matrix_path[i][j].firstElementChild;
  if (x == null) {
    valid_path.push(matrix_path[i][j]);
    return true;
  } else {
    color = x.getAttribute("id");
    if (color.startsWith(selected_piece_id.slice(0, 5))) return null;
    else {
      valid_path.push(matrix_path[i][j]);
      return null;
    }
  }
}

function find_straight_path(selected_piece) {
  let selected_piece_id = selected_piece.getAttribute("id");
  let index = all_blocks.indexOf(selected_piece.parentNode);
  let horizontal_path = [];
  let vertical_path = [];
  for (row of matrix_path)
    if (check_in(all_blocks[index], row)) {
      horizontal_path = row;
      row_index = matrix_path.indexOf(row);
      col_index = row.indexOf(all_blocks[index]);
      break;
    }
  for (row of matrix_path) vertical_path.push(row[col_index]);

  let x_left = horizontal_path.slice(0, col_index);
  let x_right = horizontal_path.slice(col_index + 1);
  x_left.reverse();
  let y_top = vertical_path.slice(0, row_index);
  let y_bottom = vertical_path.slice(row_index + 1);
  y_top.reverse();
  let net_path = [x_left, x_right, y_top, y_bottom];
  let valid_path = [];

  for (let k of net_path)
    for (let i of k) {
      x = i.firstElementChild;
      if (x == null) valid_path.push(i);
      else {
        color = x.getAttribute("id");
        if (color.startsWith(selected_piece_id.slice(0, 5))) break;
        else {
          valid_path.push(i);
          break;
        }
      }
    }
  return valid_path;
}

function find_diagonal_path(selected_piece) {
  let selected_piece_id = selected_piece.getAttribute("id");
  let index = all_blocks.indexOf(selected_piece.parentNode);
  let row_index = undefined;
  let col_index = undefined;
  let valid_path = [];
  for (row of matrix_path)
    if (check_in(all_blocks[index], row)) {
      row_index = matrix_path.indexOf(row);
      col_index = row.indexOf(all_blocks[index]);
      break;
    }

  // Calculate top-right
  let i = row_index - 1;
  let j = col_index + 1;
  let p = undefined;
  while (i >= 0 && j <= 7) {
    p = check_path(i, j, valid_path, selected_piece_id);
    if (p == null) break;
    i -= 1;
    j += 1;
  }
  // Calculating bottom-left
  i = row_index + 1;
  j = col_index - 1;
  while (i <= 7 && j >= 0) {
    p = check_path(i, j, valid_path, selected_piece_id);
    if (p == null) break;
    i += 1;
    j -= 1;
  }
  // Calculating top-left
  i = row_index - 1;
  j = col_index - 1;
  while (i >= 0 && j >= 0) {
    p = check_path(i, j, valid_path, selected_piece_id);
    if (p == null) break;
    i -= 1;
    j -= 1;
  }
  // Calculating bottom-right
  i = row_index + 1;
  j = col_index + 1;
  while (i <= 7 && j <= 7) {
    p = check_path(i, j, valid_path, selected_piece_id);
    if (p == null) break;
    i += 1;
    j += 1;
  }
  console.log(valid_path);
  return valid_path;
}

function compute_danger_zone() {
  let myset = new Set();
}

function check_in(value, list) {
  found = false;
  for (let i of list)
    if (value == i) {
      found = true;
      break;
    }
  return found;
}

function click_on_troop(event) {
  if (selected_piece == undefined) {
    selected_piece = event.target;
    valid_moves = find_valid_moves(selected_piece);
  } else {
    if (check_in(event.target.parentNode, valid_moves)) {
      index = valid_moves.indexOf(event.target.parentNode);
      killed_place = valid_moves[index];
      killed_troop = killed_place.firstElementChild;
      color = killed_troop.getAttribute("id");
      if (color.startsWith("black-")) {
        killed_black.push(killed_troop);
        all_black_pieces.splice(all_black_pieces.indexOf(killed_troop), 1);
      } else {
        killed_white.push(killed_troop);
        all_white_pieces.splice(all_white_pieces.indexOf(killed_troop), 1);
      }
      show_killed_troop(killed_troop);
      killed_place.innerHTML = "";
      move(selected_piece, killed_place);
      selected_piece = undefined;
      selected_block = undefined;
      all_pieces.splice(all_pieces.indexOf(killed_troop), 1);
    } else {
      selected_piece = event.target;
      selected_block = undefined;
      valid_moves = find_valid_moves(selected_piece);
    }
  }
  a = Math.ceil(Math.random() * 255);
  b = Math.ceil(Math.random() * 255);
  c = Math.ceil(Math.random() * 255);
  for (i of valid_moves) i.style.background = `rgb(${a},${b},${c})`;
}

function show_killed_troop(killed_troop) {
  color = killed_troop.getAttribute("id");
  if (color.startsWith("black-"))
    killed_black_container.appendChild(killed_troop);
  else killed_white_container.appendChild(killed_troop);
}

function computer_move() {
  // Computer is playing from black side
  let movable_pieces = [];
  let movable_pieces_moves = [];
  for (let i of all_black_pieces) {
    x = find_valid_moves(i);
    if (x.length > 0) {
      movable_pieces.push(i);
      movable_pieces_moves.push(x);
    }
  }
  let length_pieces = movable_pieces.length;
  // j is index of moved piece in movable pieces
  let j = Math.floor(Math.random() * length_pieces);
  let moved_piece = movable_pieces[j];
  let length_moves = movable_pieces_moves[j].length;
  let k = Math.floor(Math.random() * length_moves);
  let moved_block = movable_pieces_moves[j][k];
  check_kill_by_computer(moved_block);
  move(moved_piece, moved_block);
}

function check_kill_by_computer(moved_block) {
  if (moved_block.innerHTML != "") {
    let killed_troop = moved_block.firstElementChild;
    killed_white.push(killed_troop);
    all_white_pieces.splice(all_white_pieces.indexOf(killed_troop), 1);
    show_killed_troop(killed_troop);
    moved_block.innerHTML = "";
    all_pieces.splice(all_pieces.indexOf(killed_troop), 1);
  }
}

function transform_pawn(selected_piece, selected_block, color) {
  all_pieces.splice(all_pieces.indexOf(selected_piece), 1);
  obj = {
    white: all_white_pieces,
    black: all_black_pieces,
  };

  let queen = document.getElementById(`${color}-queen`).cloneNode(true);
  let knight = document.getElementById(`${color}-knight-1`).cloneNode(true);
  let bishop = document.getElementById(`${color}-bishop-1`).cloneNode(true);
  let rook = document.getElementById(`${color}-rook-1`).cloneNode(true);
  let x = max_troop_no[`${color}-queen`] + 1;
  queen.setAttribute("id", `${color}-queen-${x}`);
  x = max_troop_no[`${color}-knight`] + 1;
  knight.setAttribute("id", `${color}-knight-${x}`);
  x = max_troop_no[`${color}-bishop`] + 1;
  bishop.setAttribute("id", `${color}-bishop-${x}`);
  x = max_troop_no[`${color}-rook`] + 1;
  rook.setAttribute("id", `${color}-rook-${x}`);
  x = [queen, knight, bishop, rook];
  let div = document.getElementById("choose");
  div.style.visibility = "visible";

  function choose_piece(event) {
    selected_block.innerHTML = "";
    if (event.target == queen) {
      selected_block.appendChild(queen);
      max_troop_no[`${color}-queen`] += 1;
      all_pieces.push(queen);
      obj[color].splice(obj[color].indexOf(selected_piece), 1);
      obj[color].push(queen);
    }
    if (event.target == knight) {
      selected_block.appendChild(knight);
      max_troop_no[`${color}-knight`] += 1;
      all_pieces.push(knight);
      obj[color].splice(obj[color].indexOf(selected_piece), 1);
      obj[color].push(knight);
    }
    if (event.target == bishop) {
      selected_block.appendChild(bishop);
      max_troop_no[`${color}-bishop`] += 1;
      all_pieces.push(bishop);
      obj[color].splice(obj[color].indexOf(selected_piece), 1);
      obj[color].push(bishop);
    }
    if (event.target == rook) {
      selected_block.appendChild(rook);
      max_troop_no[`${color}-rook`] += 1;
      all_pieces.push(rook);
      obj[color].splice(obj[color].indexOf(selected_piece), 1);
      obj[color].push(rook);
      console.log(rook);
    }
    div.innerHTML = "";
    div.style.visibility = "hidden";
    event.target.removeEventListener("click", choose_piece);
    event.target.addEventListener("click", click_on_troop);
  }

  for (let i of x) {
    div.appendChild(i);
    i.addEventListener("click", choose_piece);
  }
}

function animate_movement(piece, block) {
  pos_box = block.getBoundingClientRect();
  pos_troop = piece.getBoundingClientRect();
  X = Math.sqrt(Math.pow(pos_troop.x - pos_box.x, 2));
  Y = Math.sqrt(Math.pow(pos_troop.y - pos_box.y, 2));
  if (pos_box.x < pos_troop.x) X = -X;
  if (!(pos_box.y > pos_troop.y)) Y = -Y;
  piece.style.transform = `translate(${X}px,${Y}px)`;
}


function reset_animation(selected_piece){
  selected_piece.style.transform = `translate(${0}px,${0}px)`;
}
