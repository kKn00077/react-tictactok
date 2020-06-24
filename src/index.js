import React from 'react'; // import 실제사용할별명 from 패키지경로및패키지명
import ReactDOM from 'react-dom';
import './index.css';

// 리액트에서는 JSX를 사용한다. Javascript를 확장한 것으로
// js 내부에서 html 코드를 작성할 수 있다.
// html 코드 내에서 {} 중괄호를 사용하여 자바스크립트 표현식, 변수 등을 표시할 수 있다. 

  //함수 컴포넌트 정의
  function Square(props) {
      //Game -> Board -> Square 로 넘겨준 props.onClick을 실행함
      return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
        // 클래스 컴포넌트 정의인 경우 onClick prop의 값은 {() => this.props.onClick()} 이어야 함.
        // 괄호가 사라진 것에 대해 주의하기
      );
  }
  
  //클래스 컴포넌트 정의
  class Board extends React.Component {

      
      renderSquare(i) { //prop 정의를 한 Square 컴포넌트를 반환한다
        //Board에서 onClick 이벤트로 Game 컴포넌트에서 넘겨받은 이벤트 핸들러를 Square 컴포넌트에 넘겨주고 있음
        return (<Square 
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)} />
        );

        //화살표 함수의 경우 다음과 같이 쓸 수 있다
        // () => this.props.onClick(i) == function() {return this.props.onClick(i)}
        // 인자가 없을 경우 : () => n // 괄호 생략 불가능
        // 인자가 하나일 경우 : param => n 혹은 (param) => n // 괄호 생략 가능
        // 인자가 여러개일 경우 : (param1, param2) => n // 괄호 생략 불가능
      }
  
    render() {
      return (
        // this (Board 클래스) 의 renderSquare 메서드를 실행한다.
        //renderSquare(n) => 이때 n값은 배열(Board.props.history[n].squares)에 매칭/이력 추가시킬 인덱스 값
        <div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
}
  
class Game extends React.Component {
    
    //Square 컴포넌트 (3*3 각각의 사각형 박스) 를 클릭했을 때 발생하는 이벤트
    handleClick(i) {
        //slice의 매개변수는 (시작 인덱스, 자를 인덱스 + 1) 로 표기해야 원하는 배열이 추출된다 (표기한 end 인덱스의 값은 포함 안하기 때문)
        const history = this.state.history.slice(0, this.state.stepNumber + 1); // 현재 판까지의 게임 기록을 가져옴 (특정 기록으로 이동 후 그 상태로 플레이 한다면 미래 기록을 날려야 하기 때문)
        const current = history[history.length - 1];
        const squares = current.squares.slice(); 
        if(calculateWinner(squares) || squares[i]){ // 현재 판에서 누가 이겼거나 이미 값이 채워져 있는 경우에는 handleClick 메서드를 더이상 실행시키지 않는다.
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O'; // 클릭할 때마다 O or X 토글 시켜 띄우도록
        this.setState({
            history : history.concat([{ // 기존 배열에 추가하는 것이 아닌 똑같이 생긴 새 배열에 원소를 추가하는 방식을 더 권장함
                squares : squares,
            }]),
            stepNumber : history.length,
            xIsNext : !this.state.xIsNext
        });
    }

    jumpTo(step) { // stepNumber를 업데이트 하는 역할
        this.setState({
            stepNumber : step,
            xIsNext : (step % 2) === 0, // stepNumber가 짝수일 때마다 xIsNext를 true로 설정 == 짝수일 때마다 클릭하면 X가 뜸
        })
    }

    constructor(props) {
        super(props); // 리액트에서의 생성자 정의 시 super(props) 호출 필수
        this.state = { // 현재 저장값 모음
            history : [{ 
                squares : Array(9).fill(null),
            }],
            stepNumber : 0, // 현재 진행중인 게임 단계(사용자가 선택한 게임 이력의 인덱스)
            xIsNext : true,
        }
    }
    
    render() {
      const history = this.state.history; // 게임 이력 데이터
      const current = history[this.state.stepNumber]; // 선택된 기록의 플레이 상태를 가지고 옴
      const winner = calculateWinner(current.squares); //누가 승자인지 체크
      
      const moves = history.map((step, move) => { // 게임 이력 리스트의 길이만큼 버튼 생성
            const desc = move ?
            'Go to move #' + move :
            'Go to game start';

            return ( 
                // db와 같이 사용할 경우 button에 key prop 를 추천한다. 어떠한 이벤트가 작용했을 경우
                // 리스트의 상태가 변한다면 사람은 단번에 알아보지만, 리액트는 컴퓨터 프로그램으로 사람이 의도한 바를 알 수 없다.
                // key prop 를 지정하면 어떤 컴포넌트의 상태를 업데이트(삭제, 추가 등) 하기에 용이하기 때문이다
                // 지정하지 않을 경우 기본값으로 인덱스 값이 할당되지만 경고가 뜬다.
                // key={i} 를 사용할 경우 경고는 안 뜨지만 동일한 문제가 생기므로 권장하지 않는다.
                
                // 새로 랜더링 했을 경우 기존에 있던 리스트에 포함된 키가 리랜더링을 한 새로운 리스트에는 그 키가 없을 경우 
                // 해당 컴포넌트를 삭제하고, 존재하지 않는 키를 가지고 있다면 컴포넌트를 새로 생성한다.
                // 동적 리스트를 랜더링 할 경우 적절한 키를 할당하는 것을 권장한다.
                // db에 마땅한 값이 없을 경우 데이터 재구성을 고려해야한다.
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
      });

      let status;
      if(winner) { // 승자가 있을 경우
        status = 'Winner: ' + winner;
      } else { // 승자가 없을 경우
        status = 'Next player: '+(this.state.xIsNext ? 'X' : 'O');
      }

      return ( // 현재 상태의 플레이 기록과 handleClick 메서드를 onClick 핸들러로 Board 컴포넌트에 넘겨준다.
        <div className="game">
          <div className="game-board">
            <Board squares={current.squares}
            onClick={(i) => this.handleClick(i)} />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  //승자체크 함수
  function calculateWinner(squares) {
    const lines = [ // 이길 수 있는 경우의 수
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]; // 만약 i가 0이라면 => a = 0, b = 1, c = 2
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) { // 빈 값이 아니고 해당 배열 인덱스에 해당되는 값이 일치한다면 승자()
        return squares[a];
      }
    }
    return null;
  }