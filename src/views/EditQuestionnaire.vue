<script>
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      tableData: [],
      // 使用session中的問卷ID
      questionnaireId: sessionStorage.getItem('currentQuestionnaireId'),
      formData: {
        questionnaireId: '',
        id: '',
        questionnaire: '',
        title: '',
        describe: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        question: '',
        questionType: '',
        isNecessary: true,
        options: '',
        isEditing: false,
        editedQuestionIndex: null,
        scrollPosition: 0
      },
    };
  },
  created() {
    console.log('$route.query:', this.$route.query);
    // 在組件被創建時恢復 localStorage 中的數據
    this.restoreFormDataFromLocalStorage();
  },
  mounted() {
    const storedData = sessionStorage.getItem('問卷');
    this.tableData = JSON.parse(storedData);
    console.log(this.$route.query);
    // 從路由查詢中取得相關資訊
    const questionnaireId = this.$route.query.questionnaireId;
    const questionnaire = JSON.parse(this.$route.query.questionnaire);
    const questionList = JSON.parse(this.$route.query.questionList);
    console.log(questionnaire);
    console.log(questionList);
    // 使用 $nextTick 來確保 DOM 已經更新完畢再執行後續的操作
    this.$nextTick(() => {
      // 將值賦給 formData
      this.formData.id = questionnaire.id;
      this.formData.title = questionnaire.title;
      this.formData.describe = questionnaire.description;
      this.formData.startDate = questionnaire.startDate;
      this.formData.endDate = questionnaire.endDate;


      // 將問題列表賦值給 tableData
      this.tableData = questionList.map((question, index) => ({
        qnId: questionnaire.id,
        quId: question.quId,
        question: question.qTitle,
        questionType: question.optionType,
        isNecessary: question.necessary,
        options: question.option,
        isSelected: false,
      }));
      // 在這裡賦值 questionnaire，確保它不是 undefined
      this.questionnaire = questionnaire;
    });
  },



  methods: {

    handleStartDateChange() {
      // 當開始時間變化時，更新結束時間的最小值
      this.$refs.endDateInput.min = this.formData.startDate;
    },

    addToTable() {
      // 實現將數據添加到表格的邏輯
      // 檢查必填字段是否為空
      if (!this.formData.question || !this.formData.questionType || !this.formData.options) {
        Swal.fire({
          title: '請將題目、類型、選項填寫完整',
          text: '題目、類型、選項不得為空。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return; // 如果有任何一項為空，停止執行
      }
      // 檢查選項至少有兩個
      const optionsArray = this.formData.options.split(';').map(option => option.trim());
      if (optionsArray.length < 2) {
        Swal.fire({
          title: '選項至少兩項',
          text: '選項不得少於兩項。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 找到已有的最大 quId，然後加 1
      const maxQuId = this.tableData.reduce((maxId, item) => {
        const quIdNumber = parseInt(item.quId);
        return quIdNumber > maxId ? quIdNumber : maxId;
      }, 0);

      // 生成新的 quId
      const quId = (maxQuId + 1);

      // 將表單數據添加到 tableData 中
      this.tableData.push({
        qnId: this.formData.id,
        quId: quId,  // 將生成的 quId 添加進去
        question: this.formData.question,
        questionType: this.formData.questionType,
        isNecessary: this.formData.isNecessary,
        options: optionsArray,  // 將選項數據也添加進去
        isSelected: false, // 新增 isSelected 屬性，用於標記是否被選中
      });


      // 存入 localStorage
      this.saveTableDataToLocalStorage();

      // 不要重置整個 formData，僅清空與問題相關的字段
      this.formData.question = '';
      this.formData.questionType = '';
      this.formData.isNecessary = true;
      this.formData.options = '';

      // 滾動到畫面底部
      window.scrollTo(0, document.body.scrollHeight);

      Swal.fire({
        title: '新增題目成功',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '確定'
      });
      return;

    },
    deleteSelected() {
      // 實現刪除所選項目的邏輯
      // 找到被選中的題目的索引
      const selectedIndexes = this.tableData
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.isSelected)
        .map((item) => item.index)
        .sort((a, b) => b - a); // 按索引降序排序

      // 如果沒有選中項目，提示使用者選擇要刪除的項目
      if (selectedIndexes.length === 0) {
        Swal.fire({
          title: '請選擇要刪除的題目',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 獲取選中的題目編號和標題
      const selectedQuestions = selectedIndexes.map((index) => ({
        number: index + 1,
        title: this.tableData[index].question
      })).reverse();
      // 顯示確認對話框
      Swal.fire({
        title: '確定刪除選中的題目嗎？',
        html: selectedQuestions.map(({ number, title }) => `<div style="text-align: left;">${number}. ${title}</div>`).join(''), showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定',
        cancelButtonText: '取消'
      }).then((result) => {
        // 如果使用者確定要刪除，執行刪除操作
        if (result.isConfirmed) {

          // 保存即將被刪除的題目資料
          const deletedItems = selectedIndexes.map((index) => ({ ...this.tableData[index] }));

          // 將被刪除的數據保存到 sessionStorage
          sessionStorage.setItem('deletedItems', JSON.stringify(deletedItems));

          // 刪除被選中的題目
          selectedIndexes.forEach((index) => {
            this.tableData.splice(index, 1);
          });

          // 使用 $nextTick 來確保 DOM 已經更新完畢再執行後續的操作
          this.$nextTick(() => {
            // 存入 localStorage
            this.saveTableDataToLocalStorage();

            //在sessionStorage被刪除的題目資料保存到 localStorage
            const deletedItemsFromSession = JSON.parse(sessionStorage.getItem('deletedItems')) || [];
            this.saveDeletedItemsToLocalStorage(deletedItemsFromSession);
          });
          Swal.fire({
            title: '刪除題目成功',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '確定'
          });
          return;

        } else {
          // 如果使用者取消刪除，重置 isSelected 狀態
          this.tableData.forEach((item) => {
            item.isSelected = false;
          });
        }
      })
    },

    editRow(index) {
      console.log('Editing Row Index:', index);
      // 實現編輯行的邏輯
      this.isEditing = true;
      this.editedQuestionIndex = index;

      // 記錄當前滾動位置
      this.scrollPosition = window.scrollY;

      // 填充表單數據為要編輯的題目資料
      const editedQuestion = this.tableData[index];
      this.formData.id = this.questionnaire.id;
      this.formData.question = editedQuestion.question;
      this.formData.questionType = editedQuestion.questionType;
      this.formData.isNecessary = editedQuestion.isNecessary;
      // 判斷是新增還是編輯來添加選項
      if (editedQuestion.options instanceof Array) {
        // 對於已存在的題目，使用原有的選項
        this.formData.options = editedQuestion.options.join(';');
      } else {
        // 對於新添加的題目，直接使用原有的選項
        this.formData.options = editedQuestion.options;
      }

      // 滾動到最上方
      window.scrollTo(0, 0);

      console.log('editedQuestion:', editedQuestion);

    },
    saveEdit() {
      // 檢查必填字段是否為空
      if (!this.formData.question || !this.formData.questionType || !this.formData.options) {
        Swal.fire({
          title: '請將題目、類型、選項填寫完整',
          text: '題目、類型、選項不得為空。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return; // 如果有任何一項為空，停止執行
      }
      // 檢查選項至少有兩個
      const optionsArray = this.formData.options.split(';').map(option => option.trim());
      if (optionsArray.length < 2) {
        Swal.fire({
          title: '選項至少兩項',
          text: '選項不得少於兩項。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 更新正在編輯的題目資料
      const editedQuestion = this.tableData[parseInt(this.editedQuestionIndex)];
      editedQuestion.question = this.formData.question;
      editedQuestion.questionType = this.formData.questionType;
      editedQuestion.isNecessary = this.formData.isNecessary;
      editedQuestion.options = this.formData.options.split(';').map(option => option.trim());

      // 不要重置整個 formData，僅清空與問題相關的字段
      this.formData.question = '';
      this.formData.questionType = '';
      this.formData.isNecessary = true;
      this.formData.options = '';

      // 退出編輯模式
      this.isEditing = false;

      // 存入 localStorage
      this.saveTableDataToLocalStorage();

      Swal.fire({
        title: '儲存變更',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '確定'
      });

    },

    cancelEdit() {
      Swal.fire({
        title: '放棄變更？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {

          // 只清空與問題相關的字段
          this.formData.question = '';
          this.formData.questionType = '';
          this.formData.isNecessary = true;
          this.formData.options = '';

          // 退出編輯模式
          this.isEditing = false;

          // 還原滾動位置
          window.scrollTo(0, this.scrollPosition);
        }
      })
    },

    //跳至確認頁前先存至localStorage
    moveToConfirm() {
      // 檢查是否有新增題目
      if (this.tableData.length === 0) {
        Swal.fire({
          title: '請新增至少一個題目',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }
      // 檢查結束時間是否早於開始時間
      const startDate = new Date(this.formData.startDate);
      const endDate = new Date(this.formData.endDate);

      if (endDate < startDate) {
        Swal.fire({
          title: '結束時間不可早於開始時間',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 檢查開始時間是否小於當前日期
      const currentDate = new Date();
      if (startDate < currentDate) {
        Swal.fire({
          title: '開始時間不可小於當前日期',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }
      
      // 將表單數據保存
      this.saveFormData();

      // 將問題列表數據保存
      this.saveTableDataToLocalStorage();

      // 導航到下一個頁面，同時傳遞 questionnaireId
      this.$router.push({
        path: '/EditConfirm',
        query: {
          questionnaireId: this.$route.query.questionnaireId,
          questionnaire: this.$route.query.questionnaire,
          questionList: this.$route.query.questionList
        }
      });
    },

    saveFormData() {
      // 在這裡實現保存表單數據的邏輯
      // 這裡可以保存問卷名稱、問卷說明、開始和結束時間等
      // 你的現有代碼中，將 this.formData 的相關字段保存到 localStorage 即可
      const formDataToSave = {
        id: this.formData.id,
        title: this.formData.title,
        describe: this.formData.describe,
        startDate: this.formData.startDate,
        endDate: this.formData.endDate,
        // 其他需要保存的字段...
      };

      // 將表單數據轉為 JSON 字串，然後保存到 localStorage
      const formDataJson = JSON.stringify(formDataToSave);
      localStorage.setItem('formData', formDataJson);
    },

    saveTableDataToLocalStorage() {
      // 將 tableData 轉為 JSON 字串，然後存入 localStorage
      const tableDataJson = JSON.stringify(this.tableData);
      localStorage.setItem('tableData', tableDataJson);
    },

    saveDeletedItemsToLocalStorage(deletedItems) {
      // 從 local storage 中獲取已存在的被刪除的題目資料
      const existingDeletedItems = JSON.parse(localStorage.getItem('deletedItems')) || [];

      // 將新刪除的題目資料添加到現有數據中
      existingDeletedItems.push(...deletedItems);

      // 將合併後的數據保存到 localStorage
      localStorage.setItem('deletedItems', JSON.stringify(existingDeletedItems));
    },

    restoreFormDataFromLocalStorage() {
      // 從 local storage 中獲取 formData 的 JSON 字串
      const formDataJson = localStorage.getItem('formData');

      // 如果存在，將其轉為對象並賦值給組件的 formData
      if (formDataJson) {
        const formData = JSON.parse(formDataJson);
        // 將解析後的數據賦值給 formData
        this.formData.id = formData.id
        this.formData.title = formData.title;
        this.formData.describe = formData.describe;
        this.formData.startDate = formData.startDate;
        this.formData.endDate = formData.endDate;
      }
    },

    cancelPage() {
      Swal.fire({
        title: '取消問卷變更?',
        text: `是否取消本次變更的問卷?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '是',
        cancelButtonText: '否'
      }).then((result) => {         //點擊確認按鈕後
        if (result.isConfirmed) {

          // 清空 localStorage
          localStorage.removeItem('formData');
          localStorage.removeItem('tableData');
          localStorage.removeItem('deletedItems');
          this.$router.push('/BackstageList');
        }
      })
    }
  }
}
</script>

<template>
  <div class="bgArea">
    <!-- <h1>{{ $route.query.questionnaireId }}</h1>
    <p>{{ JSON.parse($route.query.questionnaire) }}</p>
    <p>{{ JSON.parse($route.query.questionList) }}</p> -->

    <div class="form-container">
      <label for="questionnaire">問卷名稱：</label>
      <input type="text" class="titleInput" name="questionnaire" v-model="formData.title" />

      <label for="describe">問卷說明：</label>
      <textarea class="describe" v-model="formData.describe"></textarea>

      <div class="dateInputArea">
        <div class="dateCombination">
          <label for="startDate">開始時間：</label>
          <input class="dateInput" type="date" id="startDate" v-model="formData.startDate"
            @change="handleStartDateChange" />
        </div>
        <div class="dateCombination">
          <label for="endDate">結束時間：</label>
          <input class="dateInput" type="date" id="endDate" v-model="formData.endDate" ref="endDateInput" />
        </div>
      </div>
    </div>

    <div class="content-block">
      <div class="input-row">
        <label for="question">問題：</label>
        <input class="qTitleInput" type="text" name="question" v-model="formData.question">
      </div>
      <div class="input-row">
        <label for="questionType">類型：</label>
        <select name="questionType" v-model="formData.questionType">
          <option value="單選">單選</option>
          <option value="多選">多選</option>
        </select>
      </div>
      <div class="input-row">
        <input type="checkbox" name="isNecessary" id="isNecessary" v-model="formData.isNecessary">
        <label for="isNecessary">必填</label>
      </div>
      <div class="input-row">
        <label for="options">選項：</label>
        <textarea class="qDescribe" type="text" v-model="formData.options"></textarea>
        <span>多個答案以 ; 分隔</span>
      </div>

      <div class="icon">
        <!-- 添加題目 -->
        <i v-if="!isEditing" class="fa-solid fa-plus" @click="addToTable"></i>
        <!-- <i class="fa-solid fa-plus" @click="addToTable"></i> -->
        <!-- 取消編輯 -->
        <i v-if="isEditing" class="fa-solid fa-delete-left" @click="cancelEdit"></i>
        <!-- 保存編輯 -->
        <i v-if="isEditing" class="fa-solid fa-floppy-disk" @click="saveEdit"></i>
        <!-- 使用垃圾桶按鈕刪除選中的題目 -->
        <i v-if="tableData.length > 0" class="fa-solid fa-trash-can" @click="deleteSelected"></i>
      </div>
      <!-- 使用垃圾桶按鈕刪除選中的題目 -->
      <!-- <button @click="deleteSelected">
        <i class="fas fa-trash-can"></i>
      </button> -->

      <!-- <button @click="addToTable">新增題目</button> -->

      <!-- 顯示問題列表 -->
      <table v-if="tableData.length > 0" id="questionTable">
        <tr>
          <th></th>
          <th>#</th>
          <th>問題</th>
          <th>類型</th>
          <th>必填</th>
          <th>選項</th>
          <th>編輯</th>
        </tr>
        <tr v-for="(item, index) in tableData" :key="index">
          <td><input type="checkbox" v-model="item.isSelected"></td>
          <td>{{ index + 1 }}</td>
          <td>{{ item.question }}</td>
          <td>{{ item.questionType }}</td>
          <td>{{ item.isNecessary ? '是' : '否' }}</td>
          <td>
            {{ Array.isArray(item.options) ? item.options.join(';') : item.options }}
          </td>
          <td>
            <i class="fa-solid fa-pen" @click="editRow(index)"></i>
          </td>
        </tr>

      </table>
      <!-- <table v-if="tableData.length > 0" id="questionTable">
        <tr>
          <th>刪除</th>
          <th>#</th>
          <th>問題</th>
          <th>類型</th>
          <th>必填</th>
          <th>選項</th>
          <th>編輯</th>
        </tr>
        <tr v-for="(item, index) in tableData" :key="index">
          <td><input type="checkbox" v-model="item.isSelected"></td>
          <td>{{ index + 1 }}</td>
          <td>{{ item.question }}</td>
          <td>{{ item.questionType }}</td>
          <td>{{ item.isNecessary ? '是' : '否' }}</td>
          <td>{{ item.options.join(';') }}</td>
          <td><i class="fa-solid fa-pen" @click="editRow(index)"></i></td>
        </tr>

      </table>  -->

      <!-- <div v-if="isEditing">
        <h2>編輯題目</h2>
        <form>
          <label for="editQuestion">問題：</label>
          <input type="text" name="editQuestion" v-model="formData.question">

          <label for="editQuestionType">類型：</label>
          <select name="editQuestionType" v-model="formData.questionType">
            <option value="單選">單選</option>
            <option value="多選">多選</option>
          </select>

          <input type="checkbox" name="editIsNecessary" id="editIsNecessary" v-model="formData.isNecessary">
          <label for="editIsNecessary">必填</label>

          <label for="editOptions">選項：</label>
          <input type="text" name="editOptions" v-model="formData.options">
          <p>多個答案以 ; 分隔</p>

          <button @click="saveEdit">保存編輯</button>
        </form>
      </div> -->

      <div class="iconBottom">
        <i class="fa-solid fa-rotate-left" @click="cancelPage"></i>
        <i class="fa-solid fa-arrow-right" @click="moveToConfirm"></i>

        <!-- <button @click="cancelPage">取消</button>
        <button @click="moveToConfirm">送出</button> -->
      </div>
      <!-- <div class="iconBottom">
        <i class="fa-solid fa-arrow-left" @click="moveToPreviousPage"></i>
        <i class="fa-solid fa-arrow-right" @click="moveToConfirmPage"></i>
      </div> -->

    </div>
  </div>
</template>
<style lang="scss" scoped>
$maincolor: #A4804C;

.bgArea {
  width: 100vw;
  background-color: #f4f4ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;


  .form-container {
    width: 800px;
    background-color: #fff;
    color: #6e4e23;
    padding: 30px 80px 50px 80px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    label {
      display: block;
      margin-bottom: 8px;
    }

    .titleInput {
      width: 100%;
      height: 33px;
      margin-bottom: 16px;
      box-sizing: border-box;
    }

    .describe {
      height: 100px;
      width: 100%;
      resize: none;
      /* 防止 textarea 被手動調整大小 */
    }

    .dateInputArea {
      display: flex;
      margin-top: 16px;
      justify-content: space-between;

      .dateCombination {
        display: flex;
        flex-direction: column;

        .dateInput {
          height: 30px;
          width: 250px;
          text-align: center;
        }
      }
    }
  }

  .content-block {
    width: 800px;
    padding: 20px 0 0px 0;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: #6e4e23;

    .input-row {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
      margin-left: 360px;


    }

    .qTitleInput {
      width: 300px;
    }

    .qDescribe {
      height: 100px;
      width: 300px;
      resize: none;
      margin-right: 10px;
    }



    table {
      width: 800px;
      font-family: 'Oswald', sans-serif;
      border-collapse: collapse;
      border: thick double $maincolor ;

      th {
        background-color: $maincolor;
        color: #ffffff;
        width: 25vw;
        height: 5vh;
        text-align: center;
      }

      td {
        background-color: #ffffff;
        width: 25vw;
        height: 5vh;
        text-align: center;
      }

      tr {
        border-bottom: 1px solid #dddddd;
      }

      tr:last-of-type {
        border-bottom: 2px solid $maincolor;
      }

      tr:nth-of-type(even) td {
        background-color: #f3f3f3;
      }
    }

    .fa-trash-can {
      color: $maincolor;
      position: absolute;
      left: 265px;
      top: 745px;
      font-size: 2vw;

      &:hover {
        cursor: pointer;
        color: #DBD3A4;
      }
    }

    .fa-plus,
    .fa-floppy-disk,
    .fa-delete-left {
      color: $maincolor;
      margin-right: 10px;
      font-size: 20pt;
      padding: 0 100px;

      &:hover {
        cursor: pointer;
        color: #DBD3A4;
      }
    }

    .fa-pen {
      color: $maincolor;
      display: flex;
      justify-content: center;

      &:hover {
        cursor: pointer;
        color: #DBD3A4;
      }

    }
  }

  .fa-rotate-left {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    margin-bottom: 50px;
    position: fixed;
    left: 100px;
    bottom: 10px;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
      background-color: rgba(143, 143, 143, 0.804);
      cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
      content: '返回';
      color: white;
      font-size: 10pt;
      display: block;
      position: absolute;
      top: 50%;
      /* 相对于父元素垂直居中 */
      left: 50%;
      /* 相对于父元素水平居中 */
      transform: translate(-50%, -50%);
      /* 平移并旋转文字 */
      opacity: 0;
      /* 初始状态透明 */
      transition: opacity 0.3s ease;
      /* 添加过渡效果 */
      white-space: nowrap;
      /* 防止文字换行 */
    }

    &:hover::after {
      opacity: 1;
    }
  }

  .fa-arrow-right {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    margin-bottom: 50px;
    position: fixed;
    right: 100px;
    bottom: 10px;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
      background-color: rgba(143, 143, 143, 0.804);
      cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
      content: '下一頁';
      color: white;
      font-size: 10pt;
      display: block;
      position: absolute;
      top: 50%;
      /* 相对于父元素垂直居中 */
      left: 50%;
      /* 相对于父元素水平居中 */
      transform: translate(-50%, -50%);
      /* 平移并旋转文字 */
      opacity: 0;
      /* 初始状态透明 */
      transition: opacity 0.3s ease;
      /* 添加过渡效果 */
      white-space: nowrap;
      /* 防止文字换行 */
    }

    &:hover::after {
      opacity: 1;
    }
  }
}
</style> 
