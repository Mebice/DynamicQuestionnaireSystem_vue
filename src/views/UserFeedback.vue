<script>
import moveToPrevious from '../components/moveToPrevious.vue';
export default {
    data() {
        return {
            userStatistics: [],  // 從路由中獲取的使用者統計數據
            currentPage: 1,
            itemsPerPage: 10,
        }
    },
    components: {
        moveToPrevious
    },
    computed: {
        groupedUserStatistics() {
            // 將相同 phoneNumber 的使用者記錄合併在一起
            const grouped = this.groupByPhoneNumber(this.userStatistics);
            return Object.values(grouped);
        },
        paginatedUserStatistics() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.groupedUserStatistics.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.groupedUserStatistics.length / this.itemsPerPage);
        },
    },

    methods: {
        groupByPhoneNumber(data) {
            return data.reduce((acc, entry) => {
                const phoneNumber = entry.phoneNumber;
                if (!acc[phoneNumber]) {
                    acc[phoneNumber] = [];
                }
                acc[phoneNumber].push(entry);
                return acc;
            }, {});
        },
        sortByDateTimeDesc() {
            // 根据 dateTime 属性对 userStatistics 数组进行排序
            this.userStatistics.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        },
        changePage(page) {
            this.currentPage = page;
        },

        goToAnswerRecord(user) {
            // 假設 user 包含相應的使用者資料
            const selectedUser = {
                name: user[0].name,
                email: user[0].email,
                phoneNumber: user[0].phoneNumber,
                dateTime: user[0].dateTime,
                age: user[0].age,

            };

            // 存儲 questionnaire 和 questionList 到 sessionStorage
            const questionnaire = JSON.parse(sessionStorage.getItem('questionnaire'));
            const questionList = JSON.parse(sessionStorage.getItem('questionList'));

            // 將資料透過 query 參數傳遞至下一頁
            this.$router.push({
                path: '/AnswerRecord',
                query: {
                    user: JSON.stringify(selectedUser),
                    userStatistics: JSON.stringify(user),
                    questionnaire: JSON.stringify(questionnaire),
                    questionList: JSON.stringify(questionList),
                },
            });
        },

    },

    mounted() {
        // 讀取使用者統計數據
        this.userStatistics = JSON.parse(this.$route.query.userStatistics || '[]')

        // 獲取 query 中的 questionList 參數
        const queryQuestionnaire = this.$route.query.questionnaire
        // 將 JSON 字串轉換為對象
        const questionnaire = JSON.parse(queryQuestionnaire)
        console.log(questionnaire)

        // 獲取 query 中的 questionList 參數
        const queryQuestionList = this.$route.query.questionList
        // 將 JSON 字串轉換為對象
        const questionList = JSON.parse(queryQuestionList)
        console.log(questionList)

        // 存儲到 sessionStorage
        sessionStorage.setItem('questionnaire', JSON.stringify(questionnaire));
        sessionStorage.setItem('questionList', JSON.stringify(questionList));

        // 排序
        this.sortByDateTimeDesc();
    },
}
</script>

<template>
    <div class="bgArea">
        <!-- <p>{{ userStatistics }}</p> -->
        <moveToPrevious/>
        <table>
            <tr>
                <th>姓名</th>
                <th>電子信箱</th>
                <th>手機號碼</th>
                <th>填寫時間</th>
                <th>作答紀錄</th>
            </tr>
            <tr v-for="(user, index) in paginatedUserStatistics" :key="index">
                <td>{{ user[0].name }}</td>
                <td>{{ user[0].email }}</td>
                <td>{{ user[0].phoneNumber }}</td>
                <td>{{ user[0].dateTime }}</td>
                <td><i class="fa-solid fa-right-to-bracket" @click="goToAnswerRecord(user)"></i></td>
            </tr>
        </table>

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

    table {
        width: 70vw;
        font-family: 'Oswald', sans-serif;
        border-collapse: collapse;
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.28);
        border: thick double $maincolor ;
        text-align: center;
        margin-top: 50px;

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
            background-color: #fafcfb;
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

        .fa-right-to-bracket {
            color: $maincolor;

            &:hover {
                color: #DBD3A4;
                cursor: pointer;
            }
        }
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