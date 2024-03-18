<script>
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      tableData: [],
      title: '',
      startDate: '',
      endDate: '',
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      userStatistics: [],
      hoveredIndex: -1, // 追蹤當前懸停的行索引
    };
  },
  mounted() {
    this.searchData();
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

      this.$router.push('/');
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

    async searchData(page = 1) {
      this.isLoading = true;

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
          this.tableData = data.quizVo
            .filter(item => item.questionnaire.published)
            .map(item => ({
              ...item,
              isSelected: item.isSelected || false,
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
    async goToAnswer(item) {
      // 根据特定问卷ID发送API请求，获取用户统计数据
      const questionnaireId = item.questionnaire.id;
      try {
        const userStatistics = await this.fetchUserStatistics(questionnaireId);

        // 存储用户统计数据
        this.userStatistics = userStatistics;

        // 导航到答题页面，并将整个 item 对象和用户统计数据传递过去
        this.$router.push({
          name: 'ForestageAnswer',
          query: {
            questionnaireId: item.questionnaire.id,
            questionnaire: JSON.stringify(item.questionnaire),
            questionList: JSON.stringify(item.questionList),
            userStatistics: JSON.stringify(userStatistics),  // 将用户统计数据传递给答题页面
          }
        });
      } catch (error) {
        console.error('Error fetching user statistics:', error);
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
              text: '該問卷尚未有使用者填寫。',
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
        <div class="titleText">
          <label for="">標題</label>
        </div>
        <input class="titleInput" type="text" v-model="title" placeholder="請輸入關鍵字">
      </div>
      <div class="searchDate">
        <span class="dateText">開始時間</span>
        <input class="dateInput" type="date" id="startDate" v-model="startDate">
        <span class="dateText">結束時間</span>
        <input class="dateInput" type="date" id="endDate" v-model="endDate">
        <i class="fa-solid fa-magnifying-glass" @click="searchData"></i>
      </div>
    </div>

    <table v-if="tableData.length > 0">
      <tr>
        <th>#</th>
        <th>標題</th>
        <th>狀態</th>
        <th>開始時間</th>
        <th>結束時間</th>
        <th>填寫</th>
        <th>統計</th>
      </tr>
      <!-- 使用 v-for 迭代生成多個 <tr> -->
      <tr v-for="(item, index) in tableData" :key="index">
        <!-- 使用 v-if，只渲染 published 为 true 的行 -->
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">{{ item.questionnaire.id }}</td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">{{ item.questionnaire.title }}</td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">{{ calculateStatus(item.questionnaire.startDate,
          item.questionnaire.endDate, true) }}</td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">{{ item.questionnaire.startDate }}</td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">{{ item.questionnaire.endDate }}</td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">
          <i v-if="calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate, true) === '進行中'"
            class="fa-solid fa-pen-to-square" @click="goToAnswer(item)"></i>
        </td>
        <td v-if="item.questionnaire.published" @mouseenter="setHoveredIndex(index)"
      @mouseleave="setHoveredIndex(-1)"
      :style="{ 'background-color': index === hoveredIndex ? '#e8eee2' : '' }">
          <i v-if="item.questionnaire.published && calculateStatus(item.questionnaire.startDate, item.questionnaire.endDate, true) !== '未開始'"
            class="fa-solid fa-square-poll-vertical" @click="goToStatistics(item)"></i>
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
$maincolor: #3F6148;

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
    margin-top: 40px;
    border-radius: 5px;

    .searchTitle {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #2a4130;
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
      color: $maincolor;
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
      color: $maincolor;
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

  .fa-pen-to-square {
    font-size: 15pt;
    color: $maincolor;

    &:hover {
      cursor: pointer;
      color: #c7b862;
    }

  }

  .fa-square-poll-vertical {
    font-size: 15pt;
    color: $maincolor;

    &:hover {
      cursor: pointer;
      color: #c7b862;
    }
  }

  .noTable{
    margin-top: 180px;
    font-size: 15pt;
  }

  .paginationArea {
    position: absolute;

    .pagination button {
      position: relative;
      top: 465px;
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