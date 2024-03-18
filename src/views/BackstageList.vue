<script>
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      tableData: [],
      title: '',
      startDate: '',
      endDate: '',
      currentPage: 1,
      itemsPerPage: 10,
      hoveredIndex: -1, // 追蹤當前懸停的行索引
    };
  },
  mounted() {
    this.searchData();
  },
  // 當從別頁面回到此頁面自動刷新
  beforeRouteEnter(to, from, next) {
    // 調用刷新數據的方法
    next(vm => {
      vm.searchData();
    });
  },

  computed: {
    //分頁
    tableData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
  },
  methods: {
    addQuestionnaire() {
      // 清空 localStorage 中的 formData
      localStorage.removeItem('formData');

      // 清空 localStorage 中的題目數據
      localStorage.removeItem('tableData');

      // 清空這一頁的 tableData
      this.tableData = [];

      // 清空題目數據（假設題目數據存在formData中）
      this.formData = {
        question: '',
        questionType: '',
        isNecessary: true,
        options: '',
      };

      this.$router.push('/BackstageQuestionnaire');

    },

    calculateStatus(startDate, endDate, published) {
      const now = new Date();
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      if (!published) {
        return '未開始';
      } else if (now < startDate) {
        return '未開始';
      } else if (now >= startDate && now <= endDate) {
        return '進行中';
      } else {
        return '已結束';
      }
    },

    async searchData() {

      const params = new URLSearchParams();
      if (this.title) {
        params.append('title', this.title);
      }
      if (this.startDate) {
        // 使用 ISO 格式发送日期
        params.append('start_date', new Date(this.startDate).toISOString().split('T')[0]);
      }
      if (this.endDate) {
        // 使用 ISO 格式发送日期
        params.append('end_date', new Date(this.endDate).toISOString().split('T')[0]);
      }

      // 使用 URLSearchParams 生成查询字符串
      const queryString = params.toString();

      let url = `http://localhost:8080/api/quiz/search`;
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log('URL:', url);
      console.log('Params:', params.toString());

      try {
        const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();

        if (Array.isArray(data.quizVo)) {
          this.tableData = data.quizVo.map(item => ({
            ...item, isSelected: item.isSelected || false,
            status: this.calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate, item.questionnaire.published),
          }));
          this.totalItems = data.totalItems;
        } else {
          console.error('quizVo is not an array:', data.quizVo);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.isLoading = false;
      }

      console.log(this.tableData)
      sessionStorage.setItem('問卷', JSON.stringify(this.tableData))
    },


    deleteQuestionnaire() {
      const selectedQuestionnaires = this.tableData.filter(item => item.isSelected);
      if (selectedQuestionnaires.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: '請選擇問卷進行刪除',
        });
        return;
      }

      Swal.fire({
        title: '確認刪除問卷?',
        html: `
        <div style="text-align: left;">
          ${selectedQuestionnaires.map(item => `
            <p># ${item.questionnaire.id}, 標題 : ${item.questionnaire.title}</p>
          `).join('')}
        </div>
      `,
        // text: `${selectedQuestionnaires.map(item => JSON.stringify(item.questionnaire))}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '確認刪除',
        cancelButtonText: '取消'
      }).then((result) => {
        //點擊確認按鈕後
        if (result.isConfirmed) {        // 如果確認刪除，執行刪除的邏輯
          const questionnaireIds = selectedQuestionnaires.map(item => item.questionnaire.id);
          const apiUrl = 'http://localhost:8080/api/quiz/deleteQuestionnaire';//API
          //使用 fetch 函數向後端發送 POST 請求
          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              qnIdList: questionnaireIds
            }),
          })
            .then(response => {//處理後端返回的數據
              //如果刪除成功（HTTP 狀態碼為 OK），則打印成功的信息並執行刷新信息列表的操作（this.searchAllNewInfo()）
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('Deleted successfully:', data);
              //移除选中的项
              selectedQuestionnaires.forEach(item => {
                const index = this.tableData.indexOf(item);
                this.tableData.splice(index, 1);
              });
              Swal.fire({
                icon: 'success',
                title: '已刪除問卷',
              });

              // 刷新列表
              this.searchData();
            }).catch(error => {
              // 处理删除失败的逻辑
              console.error('Error:', error);
            });
        } else {
          // 如果取消刪除，將選中的問卷回到未勾選狀態
          selectedQuestionnaires.forEach(item => {
            item.isSelected = false;
          });
        }
      })

    },

    canEdit(item) {
      // 判斷是否可以編輯
      const now = new Date();
      const startDate = new Date(item.questionnaire.startDate);
      const isPublished = item.questionnaire.published;

      return !isPublished || (isPublished && now < startDate);
    },

    //跳转到编辑页面
    //   goToEditPage(questionnaireId) {
    //     console.log(questionnaireId)
    //     // const id = {qnid: questionnaireId}
    //     // 导航到编辑页面，并将问卷的 ID 传递过去
    //     this.$router.push({
    //       // path: '/EditQuestionnaire/:questionnaireId',
    //       name: 'EditQuestionnaire', 
    //       query:questionnaireId

    //     }); 

    //     // 將問卷ID存入session
    // sessionStorage.setItem('currentQuestionnaireId', questionnaireId);

    //    // this.$router.push('/EditQuestionnaire/:questionnaireId');
    //  },
    goToEditPage(item) {
      if (this.canEdit(item)) {
        // 导航到编辑页面，并将整个 item 对象传递过去
        this.$router.push({
          name: 'EditQuestionnaire',
          query: { questionnaireId: item.questionnaire.id, questionnaire: JSON.stringify(item.questionnaire), questionList: JSON.stringify(item.questionList) }
        });
      } else {
        alert('無法編輯該問卷');
      }
    },

    goToStatistics(item) {
      // 根據特定問卷ID發送API請求
      const questionnaireId = item.questionnaire.id;

      // 發送請求，獲取與特定問卷相關的使用者數據
      this.fetchUserStatistics(questionnaireId)
        .then(userStatistics => {
          if (userStatistics.length === 0) {
            // 如果統計數據為空，使用 SweetAlert2 彈出提示
            Swal.fire({
              icon: 'error',
              title: '暫無統計數據',
              text: '該問卷尚未有統計數據可供查看。',
            });
          } else {
            // 如果有統計數據，則將數據傳遞給統計頁面
            this.$router.push({
              name: 'Statistics',
              query: {
                questionnaireId,
                userStatistics: JSON.stringify(userStatistics),
                questionnaire: JSON.stringify(item.questionnaire),
                questionList: JSON.stringify(item.questionList),
              },
            });
          }
        })
        .catch(error => {
          console.error('Error fetching user statistics:', error);
        });
    },

    goToUserFeedback(item) {
      // 根據特定問卷ID發送API請求
      const questionnaireId = item.questionnaire.id;

      // 發送請求，獲取與特定問卷相關的使用者數據
      this.fetchUserStatistics(questionnaireId)
        .then(userStatistics => {
          if (userStatistics.length === 0) {
            // 如果統計數據為空，使用 SweetAlert2 彈出提示
            Swal.fire({
              icon: 'error',
              title: '暫無使用者填寫數據',
              text: '該問卷尚未有使用者填寫。',
            });
          } else {
            // 將數據傳遞給統計頁面
            this.$router.push({
              name: 'UserFeedback',
              query: {
                questionnaireId, userStatistics: JSON.stringify(userStatistics),
                questionnaire: JSON.stringify(item.questionnaire),
                questionList: JSON.stringify(item.questionList)
              }
            });
          }
        })
        .catch(error => {
          console.error('Error fetching user feedback:', error);
        });
    },

    async fetchUserStatistics(questionnaireId) {
      // 根據特定問卷ID發送API請求，獲取使用者統計數據
      const url = `http://localhost:8080/api/user/searchByQuestionnaireId?questionnaireId=${questionnaireId}`;

      try {
        const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();

        if (Array.isArray(data.userList)) {
          // 返回使用者數據
          return data.userList;
        } else {
          console.error('userList is not an array:', data.userList);
          return [];
        }
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        return [];
      }
    },
    //分頁
    changePage(page) {
      this.currentPage = page;
    },

    // 設置懸停的行索引
    setHoveredIndex(index) {
      this.hoveredIndex = index;
    },

  }
};
</script>

<template>
  <!-- 後台列表頁 -->
  <!-- BackstageListPage -->
  <div class="bgArea">
    <div class="searchArea">
      <div class="searchTitle">
        <label for="">標題</label>

        <input class="titleInput" type="text" v-model="title" placeholder="請輸入關鍵字">
      </div>
      <div class="searchDate">
        <span>開始時間</span>
        <input class="dateInput" type="date" id="startDate" v-model="startDate">
        <span>結束時間</span>
        <input class="dateInput" type="date" id="endDate" v-model="endDate">
        <i class="fa-solid fa-magnifying-glass" @click="searchData"></i>
      </div>
    </div>
    <div class="icon" v-if="tableData.length > 0">
      <i class="fa-solid fa-trash-can" @click="deleteQuestionnaire()"></i>

      <i class="fa-solid fa-plus" @click.native="addQuestionnaire"></i>

    </div>

    <table v-if="tableData.length > 0">
      <tr>
        <th>刪除</th>
        <th>#</th>
        <th>標題</th>
        <th>狀態</th>
        <th>開始時間</th>
        <th>結束時間</th>
        <th>編輯</th>
        <th>統計</th>
        <th>回饋</th>
      </tr>
      <!-- 使用 v-for 迭代生成多個 <tr> -->
      <tr v-for="(item, index) in tableData" :key="index">
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }"><input type="checkbox"
            v-model="item.isSelected"></td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">{{ item.questionnaire.id }}</td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">
          <!-- <span @click="goToEditPage(item.questionnaire,questionList)">
            {{ item.questionnaire.title }}
          </span> -->
          <span>
            {{ item.questionnaire.title }}
          </span>
        </td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">{{ item.questionnaire.published ?
          calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate,
            true) : '未發布' }}</td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">{{ item.questionnaire.startDate }}
        </td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">{{ item.questionnaire.endDate }}</td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">
          <i v-if="canEdit(item)" class="fa-solid fa-pencil" @click="goToEditPage(item)"></i>
        </td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }"><i
            v-if="calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate, true) !== '未開始' && item.questionnaire.published"
            class="fa-solid fa-square-poll-vertical" @click="goToStatistics(item)"></i>
        </td>
        <td @mouseenter="setHoveredIndex(index)" @mouseleave="setHoveredIndex(-1)"
          :style="{ 'background-color': index === hoveredIndex ? '#eee8e2' : '' }">
          <i v-if="calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate, true) !== '未開始' && item.questionnaire.published"
            class="fa-solid fa-file-lines" @click="goToUserFeedback(item)"></i>
        </td>
      </tr>
    </table>

    <div v-else class="noTable">
    查無搜尋結果
  </div>

    <div class="paginationArea">
      <div class="pagination">
        <button v-for="page in totalPages" :key="page" @click="changePage(page)"
          :class="{ 'active': page === currentPage }">
          {{ page }}
        </button>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
$maincolor: #A4804C;

.bgArea {
  width: 100vw;
  height: 90vh;
  background-color: #f4f4ed;
  display: flex;
  flex-direction: column;
  align-items: center;

  .searchArea {
    width: 80%;
    height: 11%;
    background-color: #fff;
    border: thick double #dddddd;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    border-radius: 5px;

    .searchTitle {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #6e4e23;
      font-weight: 700;



      .titleInput {
        width: 400px;
        margin: 0 20px 0 10px;
        padding-left: 5px;
        height: 27px;
        border: none;
        border-radius: 5px;
        background-color: #e2e8ee;
      }


    }

    .searchDate {
      display: flex;
      align-items: center;
      color: #6e4e23;
      font-weight: 700;



      .dateInput {
        width: 115px;
        margin: 0 20px 0 10px;
        padding-left: 5px;
        border: none;
        border-radius: 5px;
        background-color: #e2e8ee;

      }

      .fa-magnifying-glass {
        font-size: 20pt;
        color: $maincolor;

        &:hover {
          cursor: pointer;
          color: #DBD3A4;
        }
      }
    }

  }

  .icon {
    font-size: 17pt;
    margin-right: 72vw;


    .fa-trash-can,
    .fa-plus {
      margin: 0px 1vw;
      color: $maincolor;

      &:hover {
        color: #DBD3A4;
        cursor: pointer;
      }
    }
  }

  table {
    width: 80vw;
    font-family: 'Oswald', sans-serif;
    border-collapse: collapse;
    border: thick double $maincolor ;
    text-align: center;
    font-size: 11pt;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.28);

    //表格標題
    th {
      background-color: $maincolor;
      border-left: thick double #fff;
      color: #ffffff;
      height: 5.5vh;


    }



    td {
      height: 5vh;
      border: thick double #dddddd;
      color: #6e4e23;
      font-weight: 700;
    }

    //表格線條
    tr {
      border: thick double #dddddd;
    }

    tr:nth-of-type(even) td {
      background-color: #f3f3f3; // 偶數行
    }

    tr:nth-of-type(odd) td {
      background-color: #fafcfb; // 奇數行
    }
  }

  .fa-pencil {
    font-size: 10pt;
    color: $maincolor;

    &:hover {
      cursor: pointer;
      color: #e3c416;
    }

  }

  .fa-square-poll-vertical {
    font-size: 15pt;
    color: $maincolor;

    &:hover {
      cursor: pointer;
      color: #e3c416;
    }
  }

  .fa-file-lines {
    font-size: 15pt;
    color: $maincolor;

    &:hover {
      cursor: pointer;
      color: #e3c416;
    }

  }

  .noTable{
    margin-top: 190px;
    font-size: 15pt;
  }

  .paginationArea {
    position: absolute;

    .pagination button {
      position: relative;
      top: 475px;
      margin-right: 7px;
      padding: 4px 10px;
      border: 2px solid $maincolor;
      border-radius: 7px;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.28);
      cursor: pointer;

      &:hover {
        background-color: #DBD3A4;
      }
    }

    .pagination button.active {
      /* 添加停留在某頁時的樣式 */
      background-color: $maincolor;
      color: white;
    }
  }

}
</style>