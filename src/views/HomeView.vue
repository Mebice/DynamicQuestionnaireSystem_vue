<script>
function searchDate() {
        // 獲取開始時間和結束時間的值
        var startDate = document.getElementById("startDate").value;
        var endDate = document.getElementById("endDate").value;

        // 在這裡可以執行搜尋操作，例如向後端發送請求等

        // 這裡僅為演示，你可以根據實際需求進行擴展
        alert("開始時間：" + startDate + "\n結束時間：" + endDate);
    }
</script>

<template>
<!-- 前台列表頁 -->
<!-- ForestageListPage -->
<div class="bgArea">
  <div class="searchArea">
    <div class="searchTitle">
      <span class="titleText">問卷標題</span>
      <input class="titleInput" type="text">
      <button class="titleBtn"><i class="fa-solid fa-magnifying-glass"></i></button>
    </div>
    <div class="searchDate">
      <span class="dateText">開始時間</span>
      <input class="dateInput" type="date" id="startDate">
      <span class="dateText">結束時間</span>
      <input class="dateInput" type="date" id="endDate">
      <button class="dateBtn">搜尋</button>
    </div>
  </div>
  <table>
    <tr>
      <th>#</th>
      <th>問卷</th>
      <th>狀態</th>
      <th>開始時間</th>
      <th>結束時間</th>
      <th>觀看統計</th>
    </tr>
    <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
      <tr>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
      <td>td</td>
    </tr>
  </table>
  <div class="ListArea">

    <div class="listPage">
      <ul class="pagination">
        <li><a href="#">«</a></li>
        <li><a href="#">1</a></li>
        <li><a class="active" href="#">2</a></li>
        <li><a href="#">3</a></li>
        <li><a href="#">4</a></li>
        <li><a href="#">5</a></li>
        <li><a href="#">6</a></li>
        <li><a href="#">7</a></li>
        <li><a href="#">»</a></li>
      </ul>
    </div>
  </div>
</div>

</template>

<style lang="scss" scoped>
$maincolor:rgb(26, 62, 52);
.bgArea{
  width: 100vw;
  height: 100vh;
  background-color:rgb(226, 237, 231);
  display: flex;
  flex-direction: column;
  align-items: center;

  .searchArea{
    width: 80vw;
    height: 20vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 1%;

    .searchTitle{
      display: flex;

      .titleText{
        width: 10%;
        margin-top: 1%;
      }
      .titleInput{
        width: 50vw;
        height: 5vh;
        margin-bottom: 4vh;
        position: relative;
      }
      .titleBtn{
        background-color: #fff;
        border: #fff;
        position: absolute;
        right: 23%;
        top: 21%;
        i{
          color: $maincolor;
          font-size: 20pt;
          

        }
      }

    }

    .searchDate{
      width: 90vh;
      .dateText{
        margin: 0px 3%;
        
      }
      
      .dateInput{
        height: 4.5vh;
        margin-right: 2%;     
      }

      .dateBtn{
        border-radius: 5px;
          background-color: #21574c;
          color: white;
      }
      .dateBtn:hover{
        background-color: #fff;
        color: #21574c;
        }
      
    }

  }


  table{
    width: 80vw;
    font-family: 'Oswald', sans-serif;
    border-collapse:collapse;
    border:  thick double $maincolor ;

    th{
      background-color:#21574c;
      color:#ffffff;
      width:25vw;
      height:5vh;
      text-align: center;
    }

    td{
      background-color:#ffffff;
      width:25vw;
      height:5vh;
      text-align:center;
    }

    tr{
      border-bottom: 1px solid #dddddd;
    }

    tr:last-of-type{
      border-bottom: 2px solid #009879;
    }

    tr:nth-of-type(even) td{
      background-color:#f3f3f3;
    }

  }

  ul.pagination {
    display: inline-block;
    padding: 0;
    margin: 0;
  }

  ul.pagination li {display: inline;}

  ul.pagination li a {
      color: black;
      float: left;
      padding: 8px 16px;
      text-decoration: none;
      transition: background-color .3s;
      margin: 0 4px;
      border-radius: 10px;
      border: 2px solid $maincolor;
  }

  ul.pagination li a.active {
      background-color: #21574c;
      color: white;
      border: 1px solid #21574c;
  }

  ul.pagination li a:hover:not(.active) {background-color: #ddd;}


  .listPage{
    margin-top: 5vh;
  }
}


</style>